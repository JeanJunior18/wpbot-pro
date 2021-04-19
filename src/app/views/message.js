module.exports = {
  render(data) {
    let messages = null;

    const {
      chatId,
      id: messageId,
      isGroupMsg: isGroup,
      content,
      timestamp,
      from: fromId,
      quotedMsgObj,
      sender,
      type,
    } = data;

    const {
      id,
      pushname: profileName,
      name,
      profilePicThumbObj,
      isMyContact,
      isMe,
      isWAContact,
      isEnterprise,
      isBusiness,
    } = sender;

    if (type === 'chat') {
      messages = {
        id,
        profileName,
        name,
        avatarUrl: profilePicThumbObj.eurl,
        messageId,
        chatId,
        isMyContact,
        isGroup,
        isMe,
        isWAContact,
        isEnterprise,
        isBusiness,
        messages: {
          content,
          timestamp,
          fromId,
          quotedMsgObj,
        },
      };
    } else {
      messages = data;
    }
    console.log(messages);
  },
};
