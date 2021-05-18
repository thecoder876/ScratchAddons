import commentEmojis from "../scratch-notifier/comment-emojis.js";

export default async function ({ addon, global, console, setTimeout, setInterval, clearTimeout, clearInterval }) {
  let lastDateTime;
  let data;
  let pendingAuthChange = false;
  let addonEnabled = true;

  const getDefaultData = () => ({
    messages: [],
    lastMsgCount: null,
    username: addon.auth.username,
    ready: false,
  });

  addon.auth.addEventListener("change", () => (pendingAuthChange = true));
  resetData();
  routine();

  function resetData() {
    lastDateTime = null;
    data = getDefaultData();
  }

  async function routine() {
    await runCheckMessagesAfter({ checkOld: true }, 0);
    while (addonEnabled) {
      if (pendingAuthChange) {
        pendingAuthChange = false;
        resetData();
        routine();
        break;
      } else {
        await runCheckMessagesAfter({}, 5000);
      }
    }
  }

  function runCheckMessagesAfter(args, ms) {
    return new Promise((resolve) => {
      setTimeout(async () => {
        await checkMessages(args);
        resolve();
      }, ms);
    });
  }

  async function checkMessages({ checkOld = false } = {}) {
    if (!addon.auth.isLoggedIn) return;

    // Check if message count changed, if not, return
    const msgCount = await addon.account.getMsgCount();
    if (data.lastMsgCount === msgCount) return;
    data.lastMsgCount = msgCount;

    let checkedMessages = [];
    data.ready = false;

    if (checkOld) {
      const messagesToCheck = msgCount > 1000 ? 1000 : msgCount < 41 ? 40 : msgCount;
      const seenMessageIds = [];
      for (let checkedPages = 0; seenMessageIds.length < messagesToCheck; checkedPages++) {
        const messagesPage = await addon.account.getMessages({ offset: checkedPages * 40 });
        if (messagesPage === null || messagesPage.length === 0) break;
        for (const message of messagesPage) {
          // Make sure we don't add the same message twice,
          // it could happen since we request through pages
          if (!seenMessageIds.includes(message.id)) {
            seenMessageIds.push(message.id);
            checkedMessages.push(message);
            if (seenMessageIds.length === msgCount && msgCount > 39) break;
          }
        }
        if (messagesPage.length !== 40) break;
      }
    } else {
      checkedMessages = await addon.account.getMessages({ offset: 0 });
    }
    if (checkedMessages === null) return;
    if (!checkOld && lastDateTime === null) lastDateTime = new Date(checkedMessages[0].datetime_created).getTime();
    else {
      for (const message of checkedMessages) {
        if (!checkOld && new Date(message.datetime_created).getTime() <= lastDateTime) break;
        if (checkOld) data.messages.push(message);
        else data.messages.unshift(message);
      }
      if (data.messages.length > 40 && msgCount < 41) {
        // Remove extra messages
        data.messages.length = 40;
      }
      if (data.messages.length > 1000) {
        data.messages.length = 1000;
      }
    }
    lastDateTime = new Date(checkedMessages[0].datetime_created).getTime();
    data.ready = true;
  }

  const messageListener = (request, sender, sendResponse) => {
    if (!request.scratchMessaging) return;
    const popupRequest = request.scratchMessaging;
    if (popupRequest === "getData")
      sendResponse(data.ready ? data : { error: addon.auth.isLoggedIn ? "notReady" : "loggedOut" });
    else if (popupRequest.postComment) {
      sendComment(popupRequest.postComment).then((status) => sendResponse(status));
      return true;
    } else if (popupRequest.retrieveComments) {
      const { resourceType, resourceId, commentIds } = popupRequest.retrieveComments;
      retrieveComments(resourceType, resourceId, commentIds)
        .then((comments) => sendResponse(comments))
        .catch((err) => {
          console.error(err);
          sendResponse(err);
        });
      return true;
    } else if (popupRequest === "markAsRead") {
      addon.account.clearMessages();
    } else if (popupRequest.deleteComment) {
      const { resourceType, resourceId, commentId } = popupRequest.deleteComment;
      deleteComment({ resourceType, resourceId, commentId })
        .then((res) => sendResponse(res))
        .catch((err) => sendResponse(err));
      return true;
    }
  };
  chrome.runtime.onMessage.addListener(messageListener);
  addon.self.addEventListener("disabled", () => {
    chrome.runtime.onMessage.removeListener(messageListener);
    addonEnabled = false;
  });

  async function retrieveComments(resourceType, resourceId, commentIds, page = 1, commentsObj = {}) {
    if (resourceType === "project" || resourceType === "gallery") {
      let projectAuthor;
      if (resourceType === "project") {
        const projectRes = await fetch(`https://api.scratch.mit.edu/projects/${resourceId}`);
        if (!projectRes.ok) return commentsObj; // empty
        const projectJson = await projectRes.json();
        projectAuthor = projectJson.author.username;
      }

      const getCommentUrl = (commId) =>
        resourceType === "project"
          ? `https://api.scratch.mit.edu/users/${projectAuthor}/projects/${resourceId}/comments/${commId}`
          : `https://api.scratch.mit.edu/studios/${resourceId}/comments/${commId}`;
      const getRepliesUrl = (commId, offset) =>
        resourceType === "project"
          ? `https://api.scratch.mit.edu/users/${projectAuthor}/projects/${resourceId}/comments/${commId}/replies?offset=${offset}&limit=40&nocache=${Date.now()}`
          : `https://api.scratch.mit.edu/studios/${resourceId}/comments/${commId}/replies?offset=${offset}&limit=40&nocache=${Date.now()}`;

      for (const commentId of commentIds) {
        if (commentsObj[`${resourceType[0]}_${commentId}`]) continue;

        const res = await fetch(getCommentUrl(commentId));

        if (!res.ok) continue;
        const json = await res.json();
        // This is sometimes null for deleted comments
        if (json === null) continue;
        const parentId = json.parent_id || commentId;
        const childrenComments = {};

        let parentComment;

        if (json.parent_id) {
          const resParent = await fetch(getCommentUrl(parentId));
          if (!resParent.ok) continue;
          const jsonParent = await resParent.json();
          parentComment = jsonParent;
        } else {
          parentComment = json;
        }

        // If originally requested comment was not a parent comment, we do not use
        // "json" variable at all. We'll get info for the same comment when fetching
        // all of the parent's child comments anyway
        // Note: we need to check replies for all parent comments, reply_count doesn't work properly

        const getReplies = async (offset) => {
          const repliesRes = await fetch(getRepliesUrl(parentId, offset));
          if (!repliesRes.ok) return [];
          const repliesJson = await repliesRes.json();
          return repliesJson;
        };

        const replies = [];
        let lastRepliesLength = 40;
        let offset = 0;
        while (lastRepliesLength === 40) {
          const newReplies = await getReplies(offset);
          newReplies.forEach((c) => replies.push(c));
          lastRepliesLength = newReplies.length;
          offset += 40;
        }

        if (json.parent_id && replies.length === 0) {
          // Something went wrong, we didn't get the replies
          continue;
        }

        for (const reply of replies) {
          const commenteeReply = replies.find((c) => c.author.id === reply.commentee_id);
          const replyingTo = commenteeReply ? commenteeReply.author.username : parentComment.author.username;
          const mention = `<a href=\"https://scratch.mit.edu/users/${replyingTo}\">@${replyingTo}</a>`;
          childrenComments[`${resourceType[0]}_${reply.id}`] = {
            author: reply.author.username,
            authorId: reply.author.id,
            content: `${mention} ${fixCommentContent(reply.content)}`,
            date: reply.datetime_created,
            children: null,
            childOf: `${resourceType[0]}_${parentId}`,
            scratchTeam: reply.author.scratchteam,
          };
        }
        for (const childCommentId of Object.keys(childrenComments)) {
          commentsObj[childCommentId] = childrenComments[childCommentId];
        }

        commentsObj[`${resourceType[0]}_${parentId}`] = {
          author: parentComment.author.username,
          authorId: parentComment.author.id,
          content: fixCommentContent(parentComment.content),
          date: parentComment.datetime_created,
          children: Object.keys(childrenComments),
          childOf: null,
          scratchTeam: parentComment.author.scratchteam,
        };
      }
      return commentsObj;
    }

    const res = await fetch(
      `https://scratch.mit.edu/site-api/comments/${resourceType}/${resourceId}/?page=${page}&nocache=${Date.now()}`
    );
    const text = await res.text();
    const dom = new DOMParser().parseFromString(text, "text/html");
    for (const commentChain of dom.querySelectorAll(".top-level-reply:not(.removed)")) {
      if (commentIds.length === 0) {
        // We found all comments we had to look for
        return commentsObj;
      }
      let foundComment = false;
      const parentComment = commentChain.querySelector("div");
      const parentId = Number(parentComment.getAttribute("data-comment-id"));

      const childrenComments = {};
      const children = commentChain.querySelectorAll("li.reply:not(.removed)");
      for (const child of children) {
        const childId = Number(child.querySelector("div").getAttribute("data-comment-id"));
        if (commentIds.includes(childId)) {
          foundComment = true;
          commentIds.splice(
            commentIds.findIndex((commentId) => commentId === childId),
            1
          );
        }
        const author = child.querySelector(".name").textContent.trim();
        childrenComments[`${resourceType[0]}_${childId}`] = {
          author: author.replace(/\*/g, ""),
          authorId: Number(child.querySelector(".reply").getAttribute("data-commentee-id")),
          content: fixCommentContent(child.querySelector(".content").innerHTML),
          date: child.querySelector(".time").getAttribute("title"),
          children: null,
          childOf: `${resourceType[0]}_${parentId}`,
          scratchTeam: author.includes("*"),
        };
      }

      if (commentIds.includes(parentId)) {
        foundComment = true;
        commentIds.splice(
          commentIds.findIndex((commentId) => commentId === parentId),
          1
        );
      }

      if (foundComment) {
        const parentAuthor = parentComment.querySelector(".name").textContent.trim();
        commentsObj[`${resourceType[0]}_${parentId}`] = {
          author: parentAuthor.replace(/\*/g, ""),
          authorId: Number(parentComment.querySelector(".reply").getAttribute("data-commentee-id")),
          content: fixCommentContent(parentComment.querySelector(".content").innerHTML),
          date: parentComment.querySelector(".time").getAttribute("title"),
          children: Object.keys(childrenComments),
          childOf: null,
          scratchTeam: parentAuthor.includes("*"),
        };
        for (const childCommentId of Object.keys(childrenComments)) {
          commentsObj[childCommentId] = childrenComments[childCommentId];
        }
      }
    }
    // We haven't found some comments
    if (page < 3) return await retrieveComments(resourceType, resourceId, commentIds, ++page, commentsObj);
    else {
      console.log(
        "Could not find all comments for ",
        resourceType,
        " ",
        resourceId,
        ", remaining ids: ",
        JSON.parse(JSON.stringify(commentIds))
      );
      return commentsObj;
    }
  }

  function fixCommentContent(value) {
    const matches = value.match(/<img([\w\W]+?)[\/]?>/g);
    if (matches) {
      for (const match of matches) {
        // Replace Scratch emojis with Unicode emojis
        const src = match.match(/\<img.+src\=(?:\"|\')(.+?)(?:\"|\')(?:.+?)\>/)[1];
        const splitString = src.split("/");
        const imageName = splitString[splitString.length - 1];
        if (commentEmojis[imageName]) {
          value = value.replace(match, commentEmojis[imageName]);
        }
      }
    }
    value = value.replace(/\n/g, " ").trim(); // Remove newlines
    value = value.replace(/<a href="\//g, '<a href="https://scratch.mit.edu/');
    return value;
  }

  async function sendComment({ resourceType, resourceId, content, parent_id, commentee_id, commenteeUsername }) {
    if (resourceType === "project" || resourceType === "gallery") {
      const resourceTypeUrl = resourceType === "project" ? "project" : "studio";
      const res = await fetch(`https://api.scratch.mit.edu/proxy/comments/${resourceTypeUrl}/${resourceId}?sareferer`, {
        headers: {
          "content-type": "application/json",
          "x-csrftoken": addon.auth.csrfToken,
          "x-token": addon.auth.xToken,
        },
        body: JSON.stringify({ content, parent_id, commentee_id }),
        method: "POST",
      });
      if (res.ok) {
        const json = await res.json();
        if (json.rejected) return { error: json.rejected };
        const mention = `<a href=\"https://scratch.mit.edu/users/${commenteeUsername}\">@${commenteeUsername}</a>`;
        return {
          commentId: json.id,
          username: addon.auth.username,
          userId: addon.auth.userId,
          content: `${mention} ${fixCommentContent(json.content)}`,
        };
      } else {
        return { error: res.status };
      }
    }
    return new Promise((resolve) => {
      // For some weird reason, this only works with XHR in Chrome...
      const xhr = new XMLHttpRequest();
      xhr.open("POST", `https://scratch.mit.edu/site-api/comments/${resourceType}/${resourceId}/add/?sareferer`, true);
      xhr.setRequestHeader("x-csrftoken", addon.auth.csrfToken);
      xhr.setRequestHeader("x-requested-with", "XMLHttpRequest");

      xhr.onload = function () {
        if (xhr.status === 200) {
          try {
            const dom = new DOMParser().parseFromString(xhr.responseText, "text/html");
            const commentId = Number(dom.querySelector(".comment ").getAttribute("data-comment-id"));
            const content = fixCommentContent(dom.querySelector(".content").innerHTML);
            resolve({ commentId, username: addon.auth.username, userId: addon.auth.userId, content });
          } catch (err) {
            resolve({ error: err });
          }
        } else resolve({ error: xhr.status });
      };

      xhr.send(JSON.stringify({ content, parent_id, commentee_id }));
    });
  }

  async function deleteComment({ resourceType, resourceId, commentId }) {
    if (resourceType === "project" || resourceType === "gallery") {
      const resourceTypeUrl = resourceType === "project" ? "project" : "studio";
      const res = await fetch(
        `https://api.scratch.mit.edu/proxy/comments/${resourceTypeUrl}/${resourceId}/comment/${commentId}?sareferer`,
        {
          headers: {
            "content-type": "application/json",
            "x-csrftoken": addon.auth.csrfToken,
            "x-token": addon.auth.xToken,
          },
          method: "DELETE",
        }
      );
      if (res.ok) return 200;
      else return { error: res.status };
    }
    return new Promise((resolve) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", `https://scratch.mit.edu/site-api/comments/${resourceType}/${resourceId}/del/?sareferer`, true);
      xhr.setRequestHeader("x-csrftoken", addon.auth.csrfToken);
      xhr.setRequestHeader("x-requested-with", "XMLHttpRequest");

      xhr.onload = function () {
        if (xhr.status === 200) {
          resolve(200);
        } else resolve({ error: xhr.status });
      };

      xhr.send(JSON.stringify({ id: String(commentId) }));
    });
  }
}
