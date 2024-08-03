import { Telegraf, Markup } from "telegraf";
import CONTRACT from "./constant.js";
import {
  checkChatid,
  deleteChatId,
  getChatIdFromSubID,
  getSubIdFromChatId,
  insertData,
} from "./apiFunc.js";
import { ethers } from "ethers";
import "dotenv/config";

const bot = new Telegraf(process.env.TELEGRAF_TOKEN);

const LANGUAGE_MODE_CONST = {
  english: "EU",
  hindi: "HD",
};

let userState = {
  chatId: null,
  language: null,
  // idFlag: true,
};
const EVENTS_ARR = [
  "Place Activation",
  "Gift from freezing",
  "Overtaking gift",
  "Output",
  "Upgrade",
  "Reinvest",
  "Missed, Disabled Lavel",
  "Missed, Recognized as Inferior",
  "Overtaking",
  "Coin sent for storage",
  "Issue a coin",
  "New Partner",
  "FRGX Token",
];
let SubIdAndChatId = {};
let MyAllSubIds = [];

//#region Contract Events

const ListenerFunction = async () => {
  try {
    const provider = new ethers.providers.JsonRpcProvider(CONTRACT.rpcProvider);
    const signer = provider.getSigner();
    const oxInstance = new ethers.Contract(
      CONTRACT.contract_address,
      CONTRACT.oxABI,
      signer
    );
    // console.log("Contract===> " , oxInstance);
    oxInstance.on(
      "Registration",
      async (newUserId, orignalRefId, currentRefId, time) => {
        for (let index = 0; index < MyAllSubIds.length; index++) {
          const chatIdOfSub = SubIdAndChatId[MyAllSubIds[index]];
          console.log(`Registration Called ==> `);
          if (chatIdOfSub) {
            for (let i = 0; i < chatIdOfSub.length; i++) {
              console.log(
                `Chat Id => ${
                  chatIdOfSub[i]
                } Registration ::\n newUserId => ${ethers.BigNumber.from(
                  newUserId
                ).toNumber()} | orignalRefId => ${ethers.BigNumber.from(
                  orignalRefId
                ).toNumber()} | currentRefId => ${ethers.BigNumber.from(
                  currentRefId
                ).toNumber()}
              `
              );
              if (MyAllSubIds[0] === orignalRefId) {
                sendMessage(
                  chatIdOfSub[i],
                  `Registration ::\n newUserId => ${ethers.BigNumber.from(
                    newUserId
                  ).toNumber()} | orignalRefId => ${ethers.BigNumber.from(
                    orignalRefId
                  ).toNumber()} | currentRefId => ${ethers.BigNumber.from(
                    currentRefId
                  ).toNumber()}
                    `
                );
              }
            }
          }
        }

        // console.log(
        //   `newUserId Id => ${ethers.BigNumber.from(
        //     newUserId
        //   ).toNumber()} | orignalRefId ID => ${ethers.BigNumber.from(
        //     orignalRefId
        //   ).toNumber()} | currentRefId => ${ethers.BigNumber.from(
        //     currentRefId
        //   ).toNumber()}
        //     `
        // );
      }
    );

    oxInstance.on("DirectPaid", async (to, from, amount, level, timeNow) => {
      for (let index = 0; index < MyAllSubIds.length; index++) {
        const chatIdOfSub = SubIdAndChatId[MyAllSubIds[index]];
        if (!chatIdOfSub) {
          return;
        }
        for (let i = 0; i < chatIdOfSub.length; i++) {
          if (MyAllSubIds[0] === to) {
            console.log(
              `Chat Id => ${
                chatIdOfSub[i]
              } DirectPaid ::\n to => ${ethers.BigNumber.from(
                to
              ).toNumber()} | from => ${ethers.BigNumber.from(
                from
              ).toNumber()} | Amount => ${toEth(amount)}
               | level => ${ethers.BigNumber.from(level).toNumber()}
            `
            );

            sendMessage(
              chatIdOfSub[i],
              `DirectPaid ::\n to => ${ethers.BigNumber.from(
                to
              ).toNumber()} | from => ${ethers.BigNumber.from(
                from
              ).toNumber()} || Amount => ${toEth(amount)}
               | level => ${ethers.BigNumber.from(level).toNumber()}
                `
            );
          }
        }
      }
    });

    oxInstance.on(
      "TreePayout",
      async (receiverId, senderId, matrix, level, amount, time) => {
        for (let index = 0; index < MyAllSubIds.length; index++) {
          const chatIdOfSub = SubIdAndChatId[MyAllSubIds[index]];
          if (!chatIdOfSub) {
            return;
          }
          for (let i = 0; i < chatIdOfSub.length; i++) {
            console.log(
              `Chat Id => ${
                chatIdOfSub[i]
              } | Receiver Id => ${ethers.BigNumber.from(
                receiverId
              ).toNumber()} | Sender ID => ${ethers.BigNumber.from(
                senderId
              ).toNumber()} | Level => ${ethers.BigNumber.from(
                level
              ).toNumber()} | Amount => ${toEth(amount)}
            `
            );
            if (MyAllSubIds[0] === receiverId) {
              sendMessage(
                chatIdOfSub[i],
                `TreePayout ::\n Receiver Id => ${ethers.BigNumber.from(
                  receiverId
                ).toNumber()} | Sender ID => ${ethers.BigNumber.from(
                  senderId
                ).toNumber()} | Level => ${ethers.BigNumber.from(
                  level
                ).toNumber()} | Amount => ${toEth(amount)}
                  `
              );
            }
          }
        }

        // for (let i = 0; i < CHAT_IDS.length; i++) {
        //   console.log(
        //     `Chat Id => ${CHAT_IDS[i]} | Receiver Id => ${ethers.BigNumber.from(
        //       receiverId
        //     ).toNumber()} | Sender ID => ${ethers.BigNumber.from(
        //       senderId
        //     ).toNumber()} | Level => ${ethers.BigNumber.from(
        //       level
        //     ).toNumber()} | Amount => ${toEth(amount)}
        //       `
        //   );
        //   sendMessage(
        //     CHAT_IDS[i],
        //     `Receiver Id => ${ethers.BigNumber.from(
        //       receiverId
        //     ).toNumber()} | Sender ID => ${ethers.BigNumber.from(
        //       senderId
        //     ).toNumber()} | Level => ${ethers.BigNumber.from(
        //       level
        //     ).toNumber()} | Amount => ${toEth(amount)}
        //       `
        //   );
        // }
      }
    );
    oxInstance.on(
      "Reinvest",
      async (
        reinvestUserId,
        newUserId,
        newCurrentReferrerId,
        level,
        reInvestCount,
        time
      ) => {
        for (let index = 0; index < MyAllSubIds.length; index++) {
          const chatIdOfSub = SubIdAndChatId[MyAllSubIds[index]];
          if (!chatIdOfSub) {
            return;
          }
          for (let i = 0; i < chatIdOfSub.length; i++) {
            if (MyAllSubIds[0] === newUserId) {
              console.log(
                `Chat Id => ${
                  chatIdOfSub[i]
                } | reinvestUserId => ${ethers.BigNumber.from(
                  reinvestUserId
                ).toNumber()} | newUserId => ${ethers.BigNumber.from(
                  newUserId
                ).toNumber()} | Level => ${ethers.BigNumber.from(
                  level
                ).toNumber()} | newCurrentReferrerId => ${
                  ethers.BigNumber.from(newCurrentReferrerId).toNumber
                }
              `
              );

              sendMessage(
                chatIdOfSub[i],
                `Reinvest ::\n reinvestUserId => ${ethers.BigNumber.from(
                  reinvestUserId
                ).toNumber()} | newUserId => ${ethers.BigNumber.from(
                  newUserId
                ).toNumber()} | Level => ${ethers.BigNumber.from(
                  level
                ).toNumber()} | newCurrentReferrerId => ${
                  ethers.BigNumber.from(newCurrentReferrerId).toNumber
                }
                  `
              );
            }
          }
        }
      }
    );
    oxInstance.on(
      "FreezeAmount",
      async (freezeUserId, senderId, level, amount, time) => {
        // for (let index = 0; index < MyAllSubIds.length; index++) {
        //   const chatIdOfSub = SubIdAndChatId[MyAllSubIds[index]];
        if (!chatIdOfSub) {
          return;
        }
        // for (let i = 0; i < chatIdOfSub.length; i++) {
        //     if (MyAllSubIds[0] === senderId) {
        //       console.log(
        //         `Chat Id => ${
        //           chatIdOfSub[i]
        //         } | freezeUserId => ${ethers.BigNumber.from(
        //           freezeUserId
        //         ).toNumber()} | senderId => ${ethers.BigNumber.from(
        //           senderId
        //         ).toNumber()} | Level => ${ethers.BigNumber.from(
        //           level
        //         ).toNumber()} | amount => ${
        //           toEth(amount)
        //         }
        //       `
        //       );
        //       sendMessage(
        //         chatIdOfSub[i],
        //         `FreezeAmount ::\n freezeUserId => ${ethers.BigNumber.from(
        //           freezeUserId
        //         ).toNumber()} | senderId => ${ethers.BigNumber.from(
        //           senderId
        //         ).toNumber()} | Level => ${ethers.BigNumber.from(
        //           level
        //         ).toNumber()} | amount => ${
        //           toEth(amount)
        //         }
        //           `
        //       );
        //     }
        //   }
        // }
      }
    );
    oxInstance.on(
      "NewUserPlace",
      async (
        sender,
        userId,
        referrerId,
        level,
        place,
        reInvestCount,
        originalReferrer,
        time
      ) => {
        for (let index = 0; index < MyAllSubIds.length; index++) {
          const chatIdOfSub = SubIdAndChatId[MyAllSubIds[index]];
          if (!chatIdOfSub) {
            return;
          }
          for (let i = 0; i < chatIdOfSub.length; i++) {
            if (MyAllSubIds[0] === userId) {
              console.log(
                `Chat Id => ${
                  chatIdOfSub[i]
                } | sender => ${ethers.BigNumber.from(
                  sender
                ).toNumber()} | userId => ${ethers.BigNumber.from(
                  userId
                ).toNumber()} | Level => ${ethers.BigNumber.from(
                  level
                ).toNumber()} | referrerId => ${
                  ethers.BigNumber.from(referrerId).toNumber
                } | place => ${
                  ethers.BigNumber.from(place).toNumber
                } | reInvestCount => ${
                  ethers.BigNumber.from(reInvestCount).toNumber
                } | originalReferrer => ${
                  ethers.BigNumber.from(originalReferrer).toNumber
                }
              `
              );

              sendMessage(
                chatIdOfSub[i],
                `NewUserPlace ::\n sender => ${ethers.BigNumber.from(
                  sender
                ).toNumber()} | userId => ${ethers.BigNumber.from(
                  userId
                ).toNumber()} | Level => ${ethers.BigNumber.from(
                  level
                ).toNumber()} | referrerId => ${
                  ethers.BigNumber.from(referrerId).toNumber
                } | place => ${
                  ethers.BigNumber.from(place).toNumber
                } | reInvestCount => ${
                  ethers.BigNumber.from(reInvestCount).toNumber
                } | originalReferrer => ${
                  ethers.BigNumber.from(originalReferrer).toNumber
                }
                  `
              );
            }
          }
        }
      }
    );
    oxInstance.on(
      "FundsPassedUp",
      async (receiverWhoMissedId, sender, level, amountMissed, time) => {
        for (let index = 0; index < MyAllSubIds.length; index++) {
          const chatIdOfSub = SubIdAndChatId[MyAllSubIds[index]];
          if (!chatIdOfSub) {
            return;
          }
          for (let i = 0; i < chatIdOfSub.length; i++) {
            if (MyAllSubIds[0] === sender) {
              console.log(
                `Chat Id => ${
                  chatIdOfSub[i]
                } | sender => ${ethers.BigNumber.from(
                  sender
                ).toNumber()} | receiverWhoMissedId => ${ethers.BigNumber.from(
                  receiverWhoMissedId
                ).toNumber()} | Level => ${ethers.BigNumber.from(
                  level
                ).toNumber()} | amountMissed => ${toEth(amountMissed)}
              `
              );

              sendMessage(
                chatIdOfSub[i],
                `FundsPassedUp ::\n sender => ${ethers.BigNumber.from(
                  sender
                ).toNumber()} | receiverWhoMissedId => ${ethers.BigNumber.from(
                  receiverWhoMissedId
                ).toNumber()} | Level => ${ethers.BigNumber.from(
                  level
                ).toNumber()} | amountMissed => ${toEth(amountMissed)}
                  `
              );
            }
          }
        }
      }
    );
    oxInstance.on(
      "Upgrade",
      async (msgSenderId, orignalRefId, currentRefId, level, time) => {
        for (let index = 0; index < MyAllSubIds.length; index++) {
          const chatIdOfSub = SubIdAndChatId[MyAllSubIds[index]];
          if (!chatIdOfSub) {
            return;
          }
          for (let i = 0; i < chatIdOfSub.length; i++) {
            if (MyAllSubIds[0] === orignalRefId) {
              console.log(
                `Chat Id => ${
                  chatIdOfSub[i]
                } | msgSenderId => ${ethers.BigNumber.from(
                  msgSenderId
                ).toNumber()} | orignalRefId => ${ethers.BigNumber.from(
                  orignalRefId
                ).toNumber()} | Level => ${ethers.BigNumber.from(
                  level
                ).toNumber()} | currentRefId => ${
                  ethers.BigNumber.from(currentRefId).toNumber
                } 
              `
              );

              sendMessage(
                chatIdOfSub[i],
                `Upgrade ::\n msgSenderId => ${ethers.BigNumber.from(
                  msgSenderId
                ).toNumber()} | orignalRefId => ${ethers.BigNumber.from(
                  orignalRefId
                ).toNumber()} | Level => ${ethers.BigNumber.from(
                  level
                ).toNumber()} | currentRefId => ${
                  ethers.BigNumber.from(currentRefId).toNumber
                }
                  `
              );
            }
          }
        }
      }
    );
  } catch (error) {
    console.log("Error in listner Func ==> ", error);
  }
};






await ListenerFunction().then(() => {
  console.log("contract event listening....");
});





//#region Contract Events 2.0









async function sendMessage(chatId, message) {
  console.log("Chat Id ==>", chatId);
  try {
    await bot.telegram.sendMessage(chatId, message);
    console.log(`Message sent to chat ID ${chatId}`);
  } catch (error) {
    console.error(`Failed to send message to chat ID ${chatId}:`, error);
  }
}

function toEth(amount, decimal = 18) {
  const toEth = ethers.utils.formatUnits(amount, decimal);
  return toEth.toString();
}

// region Bot region

const defaultMenu = Markup.keyboard([["Accounts", "Settings"]]).resize();

// const defaultMenu = Markup.inlineKeyboard([
//   [
//     Markup.button.callback("Accounts", "accounts_action"),
//     Markup.button.callback("Settings", "setting_action"),
//   ],
// ]);

bot.start(async (ctx) => {
  try {
    console.log("Bot Start ...");

    let res = await checkChatid(ctx.from.id);

    console.log("res===>", res);
    if (res == 200) {
      let language = userState.language;

      const messages = {
        [LANGUAGE_MODE_CONST.english]: {
          reply: "✅ Changes were successfully accepted",
          welcome:
            "Welcome!! \ntelegram bot sends you instant free notifications \nabout making profits, registering new partners and other important events in your account and the entire ecosystem. \n\nTo start using all the features of the Telegram bot, subscribe to the official Telegram channel at the link below.",
        },
        [LANGUAGE_MODE_CONST.hindi]: {
          reply: "✅ सफलतापूर्वक परिवर्तन स्वीकार लिए गए",
          welcome:
            "स्वागतम्!! \nटेलीग्राम बॉट आपको तुरंत मुफ्त सूचनाएँ भेजता है। यह सूचनाएँ आपको लाभ कमाने, नए साझेदारों को पंजीकृत करने और आपके खाते और पूरे इकोसिस्टम में अन्य महत्वपूर्ण घटनाओं के बारे में बताती हैं। \n\nटेलीग्राम बॉट की सभी सुविधाओं का उपयोग करने के लिए, नीचे दिए गए लिंक पर जाकर आधिकारिक टेलीग्राम चैनल को सब्सक्राइब करें।",
        },
      };
      console.log("sg ===>>>", messages[language]);

      await ctx.reply("You are already registered");
      await ctx.reply(messages[language].reply);
      await ctx.reply(
        messages[language].welcome,
        getSubscriptionButtons(language)
      );
    } else {
      await ctx.reply(
        "Select the language of the bot interface",
        Markup.inlineKeyboard([
          [
            Markup.button.callback("EU", "language_selected_eng"),
            Markup.button.callback("HD", "language_selected_hindi"),
          ],
        ])
      );
    }
  } catch (error) {
    console.error("Error while starting BOT:", error);
  }
});

// Language selection handlers
const handleLanguageSelection = async (ctx, language) => {
  userState.chatId = ctx.from.id;
  userState.language = language;
  // userState.idFlag = true;

  const messages = {
    [LANGUAGE_MODE_CONST.english]: {
      reply: "✅ Changes were successfully accepted",
      welcome:
        "Welcome!! \ntelegram bot sends you instant free notifications \nabout making profits, registering new partners and other important events in your account and the entire ecosystem. \n\nTo start using all the features of the Telegram bot, subscribe to the official Telegram channel at the link below.",
    },
    [LANGUAGE_MODE_CONST.hindi]: {
      reply: "✅ सफलतापूर्वक परिवर्तन स्वीकार लिए गए",
      welcome:
        "स्वागतम्!! \nटेलीग्राम बॉट आपको तुरंत मुफ्त सूचनाएँ भेजता है। यह सूचनाएँ आपको लाभ कमाने, नए साझेदारों को पंजीकृत करने और आपके खाते और पूरे इकोसिस्टम में अन्य महत्वपूर्ण घटनाओं के बारे में बताती हैं। \n\nटेलीग्राम बॉट की सभी सुविधाओं का उपयोग करने के लिए, नीचे दिए गए लिंक पर जाकर आधिकारिक टेलीग्राम चैनल को सब्सक्राइब करें।",
    },
  };

  await ctx.reply(messages[language].reply);
  await ctx.reply(messages[language].welcome, getSubscriptionButtons(language));
};

bot.action("language_selected_eng", (ctx) =>
  handleLanguageSelection(ctx, LANGUAGE_MODE_CONST.english)
);
bot.action("language_selected_hindi", (ctx) =>
  handleLanguageSelection(ctx, LANGUAGE_MODE_CONST.hindi)
);

const getSubscriptionButtons = (language) => {
  if (language === LANGUAGE_MODE_CONST.hindi) {
    return Markup.inlineKeyboard([
      [
        Markup.button.callback(
          "@OurChannel पर सब्सक्राइब करें।",
          "add_subscription"
        ),
      ],
      [
        Markup.button.callback(
          "मैंने पहले ही सब्सक्राइब कर लिया है।",
          "add_subscription"
        ),
      ],
    ]);
  }
  return Markup.inlineKeyboard([
    [Markup.button.callback("subscribe @OurChannel", "add_subscription")],
    [Markup.button.callback("i already subscribed", "add_subscription")],
  ]);
};

// Handler for subscription actions
bot.action("add_subscription", async (ctx) => {
  // userState.idFlag = true;
  const prompt =
    userState.language === LANGUAGE_MODE_CONST.hindi
      ? "अपना वॉलेट/आईडी दर्ज करें।"
      : "Enter your wallet/id";
  await ctx.reply(prompt);
});

bot.hears("Accounts", async (ctx) => {
  try {
    let allSubs = (await getSubIdFromChatId(ctx.from.id)).data;

    if (!Array.isArray(allSubs)) {
      console.error("allSubs is not an array:", allSubs);
      return ctx.reply("An error occurred fetching subscriptions.");
    }

    let messageContent = `Number Of Subscription => ${allSubs.length} \n\n Click on the ID you are interested in to configure the event filter. \n`;

    console.log("Account Chat Id all Subs =>", allSubs);

    const idButtons = allSubs.map((id) => [
      Markup.button.callback(`ID => ${id}`, `select_${id}`),
    ]);

    idButtons.push([
      Markup.button.callback("Add", "add_subscription"),
      Markup.button.callback("Delete", "delete_subscription"),
    ]);

    await ctx.reply(messageContent.trim(), Markup.inlineKeyboard(idButtons));
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    ctx.reply("An error occurred fetching subscriptions.");
  }
});

bot.action(/^select_(.+)$/, async (ctx) => {
  const chatId = ctx.from.id;
  const selectedId = ctx.match[1];
  console.log("Seleted Id in select => ", selectedId);

  let btns = [
    [Markup.button.callback("Exclude event type", `ex_event_${selectedId}`)],
  ];
  btns.push([Markup.button.callback("Go Back", "go_back")]);

  await ctx.reply(`Setting for ID ${selectedId}`, Markup.inlineKeyboard(btns));
});

bot.action(/^ex_event_(.+)$/, async (ctx) => {
  const chatId = ctx.from.chatId;
  const selectedID = ctx.match[1];

  let messageContent = `Personalize your event for ID ${selectedID} by selection only the right ones. \n ✅ - Actived \n ☑ - Not Activated`;

  const idButtons = EVENTS_ARR.map((evnt) => [
    Markup.button.callback(
      `${evnt}`,
      `evnt_action_${selectedID}_${evnt}`
    ),
  ]);

  idButtons.push([Markup.button.callback("Go Back", `select_${selectedID}`)]);

  await ctx.reply(messageContent.trim(), Markup.inlineKeyboard(idButtons));
});

bot.action(/^evnt_action_(.+)_(.+)$/, async (ctx) => {
  const chatId = ctx.from.chatId;
  const selectedID = ctx.match[1];
  const selectedEvent = ctx.match[2];

  await ctx.reply(
    `selected ID => ${selectedID} , selected Event -> ${selectedEvent}`
  );
});

bot.action("delete_subscription", async (ctx) => {
  try {
    let chatId = ctx.from.id;
    let allSubs = (await getSubIdFromChatId(ctx.from.id)).data;

    if (!Array.isArray(allSubs)) {
      console.error("allSubs is not an array:", allSubs);
      return ctx.reply("An error occurred fetching subscriptions.");
    }

    let messageContent = `Select the account you want to delete.📤`;

    console.log("Account Chat Id all Subs =>", allSubs);

    const idButtons = allSubs.map((id) => [
      Markup.button.callback(`ID => ${id}`, `select_delete_${id}`),
    ]);
    idButtons.push([Markup.button.callback("Go Back", "go_back")]);
    await ctx.reply(messageContent.trim(), Markup.inlineKeyboard(idButtons));
  } catch (error) {
    console.log("Error in delete sub Ids ==>", error);
  }
});

bot.action(/^select_delete_(.+)$/, async (ctx) => {
  let chatId = ctx.from.id;
  const selectedId = ctx.match[1];
  try {
    let res = await deleteChatId(chatId, selectedId);
    console.log("Res ===>>", res);

    if (res.status) {
      await ctx.reply(`✔ Your Id ${selectedId} is Successfully deleted.`);
    } else {
      await ctx.reply(`❌ ${res.data}.`);
    }
  } catch (error) {}

  // Implement additional logic for handling selected ID
});

bot.action("go_back", async (ctx) => {
  try {
    let allSubs = (await getSubIdFromChatId(ctx.from.id)).data;

    if (!Array.isArray(allSubs)) {
      console.error("allSubs is not an array:", allSubs);
      return ctx.reply("An error occurred fetching subscriptions.");
    }

    let messageContent = `Number Of Subscription => ${allSubs.length} \n\n Click on the ID you are interested in to configure the event filter. \n`;

    console.log("Account Chat Id all Subs =>", allSubs);

    const idButtons = allSubs.map((id) => [
      Markup.button.callback(`ID => ${id}`, `select_${id}`),
    ]);

    idButtons.push([
      Markup.button.callback("Add", "add_subscription"),
      Markup.button.callback("Delete", "delete_subscription"),
    ]);

    await ctx.reply(messageContent.trim(), Markup.inlineKeyboard(idButtons));
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    ctx.reply("An error occurred fetching subscriptions.");
  }
});

bot.action("change_language", async (ctx) => {
  const chatId = ctx.from.id;

  const btn = Markup.inlineKeyboard([
    [
      Markup.button.callback("EU", "language_selected_eng"),
      Markup.button.callback("HD", "language_selected_hindi"),
    ],
    [Markup.button.callback("Go Back", "go_back_lang")],
  ]);

  await ctx.reply("Select the language of the bot interface", btn);
});

bot.action("go_back_lang", async (ctx) => {
  let messageContent = "General Setting of your account";
  let btn = Markup.inlineKeyboard([
    [Markup.button.callback("Language", "change_language")],
    [Markup.button.callback("Go Back", "go_back")],
  ]);
  ctx.reply(messageContent.trim(), btn);
});

bot.hears("Settings", async (ctx) => {
  // const chat_id = ctx.from.id;

  let messageContent = "General Setting of your account";
  let btn = Markup.inlineKeyboard([
    [Markup.button.callback("Language", "change_language")],
    [Markup.button.callback("Go Back", "go_back")],
  ]);
  ctx.reply(messageContent.trim(), btn);
});

bot.on("text", async (ctx) => {
  const userId = ctx.message.text;

  if (userState.chatId && userState.language && userId) {
    const result = await insertData({
      chat_id: userState.chatId,
      language: userState.language,
      subscriber_id: userId,
    });
    // userState.idFlag = false;
    // console.log("Result ===>>", result);
    let responseMessage;
    // Check if the operation was successful
    if (result.status) {
      responseMessage =
        userState.language === LANGUAGE_MODE_CONST.hindi
          ? "✅ आपका आईडी सफलतापूर्वक दर्ज किया गया है।"
          : "✅ Your ID has been successfully recorded.";
    } else {
      // Handle the case where the data already exists
      if (result.message === "Already exist") {
        responseMessage =
          userState.language === LANGUAGE_MODE_CONST.hindi
            ? "✔️ यह आईडी पहले से ही मौजूद है।"
            : "✔️ This ID already exists.";
      } else if (result.message === "Subcriber Id Invalid") {
        responseMessage =
          userState.language === LANGUAGE_MODE_CONST.hindi
            ? "✔️ सब्सक्राइबर आईडी अमान्य।"
            : "✔️ Subcriber Id Invalid.";
      } else {
        // Handle other failure scenarios
        responseMessage =
          userState.language === LANGUAGE_MODE_CONST.hindi
            ? "❌ कुछ गलत हो गया। कृपया पुनः प्रयास करें।"
            : "❌ Something went wrong. Please try again.";
      }
    }

    await ctx.reply(responseMessage, defaultMenu);
  } else {
    await ctx.reply(
      userState.language === LANGUAGE_MODE_CONST.hindi
        ? "पहले भाषा को चुनें।"
        : "Please select the language first from setting."
    );
  }

  MyAllSubIds = await getSubIdFromChatId(userState.chatId);
  // console.log("All my Sub Ids ==> ", MyAllSubIds);
  if (MyAllSubIds.length > 0) {
    for (const subIds of MyAllSubIds) {
      const chatIds = await getChatIdFromSubID(subIds);
      SubIdAndChatId[subIds] = chatIds;
    }
  }

  // console.log(" Id and Chat Id Mapping ===>>> ", SubIdAndChatId);
});

bot.action("accounts_action", async (ctx) => {
  // userState.idFlag = true;
  const chat_id = ctx.from.id;
  console.log("Account Chat Id =>", chat_id);
  // console.log("Account Chat Id =>", ctx.from.id);

  let messageContent = "Subscription IDs:\n";

  MyAllSubIds.map((id, index) => {
    messageContent += `${index + 1}. ${id}\n`;
  });
  ctx.reply(messageContent.trim());
});

bot.launch(() => {
  console.log("bot is live!!!!!");
});
ListenerFunction().then(() => {
  console.log("contract event listening....");
});
