import { Telegraf, Markup } from "telegraf";
import CONTRACT from "./constant.js";
import {
  checkChatid,
  deleteChatId,
  editData,
  getChatIdFromSubID,
  getDataFromChatId,
  insertData,
} from "./apiFunc.js";
import { ethers } from "ethers";
import "dotenv/config";

const bot = new Telegraf(process.env.TELEGRAM_URL);

const LANGUAGE_MODE_CONST = {
  english: "EU",
  thai: "TH",
};

let userState = {
  chatId: null,
  language: null,
  // idFlag: true,
};
const EVENTS_ARR = [
  "Place Activation",
  "Upgrade",
  "Reinvest",
  "Missed, Disabled Lavel",
  "New Partner",
];
const EVENTS_ARR_THAI = [
  "การเปิดใช้งานตำแหน่ง",
  "การอัปเกรด",
  "การลงทุนซ้ำ",
  "ระดับที่พลาดหรือปิดการใช้งาน",
  "พันธมิตรใหม่",
];
let SUB_EVENT_ARR = [];
let SubIdAndChatId = {};
let MyAllSubIds = [];
// const chatIdOfSub = [];
//#region Contract Events

// const ListenerFunction = async () => {
//   try {
//     const toNumber = (bigNumber) => ethers.BigNumber.from(bigNumber).toNumber();
//     const logAndSendMessage = (chatId, eventType, message) => {
//       // console.log(`Chat Id => ${chatId} | ${eventType} :: ${message}`);
//       sendMessage(chatId, `${eventType} :: ${message}`);
//     };

//     const provider = new ethers.providers.JsonRpcProvider(CONTRACT.rpcProvider);
//     const signer = provider.getSigner();
//     const oxInstance = new ethers.Contract(
//       CONTRACT.contract_address,
//       CONTRACT.oxABI,
//       signer
//     );
//     // console.log("Contract===> " , oxInstance);
//     oxInstance.on(
//       "Registration",
//       async (newUserId, orignalRefId, currentRefId, time) => {
//         MyAllSubIds.forEach((subId) => {
//           const chatIds = SubIdAndChatId[subId];
//           if (chatIds) {
//             if (orignalRefId == subId) {
//               chatIds.forEach((chatId) => {
//                 const message = `newUserId => ${toNumber(
//                   newUserId
//                 )} | orignalRefId => ${toNumber(
//                   orignalRefId
//                 )} | currentRefId => ${toNumber(currentRefId)}`;
//                 logAndSendMessage(chatId, "Registration", message);
//               });
//             }
//           }
//         });
//       }
//     );

//     oxInstance.on("DirectPaid", async (to, from, amount, level, timeNow) => {
//       MyAllSubIds.forEach((subId) => {
//         const chatIds = SubIdAndChatId[subId];
//         if (chatIds) {
//           if (subId === to) {
//             chatIds.forEach((chatId) => {
//               const message = `to => ${toNumber(to)} | from => ${toNumber(
//                 from
//               )} | Amount => ${toEth(amount)} | level => ${toNumber(level)}`;
//               logAndSendMessage(chatId, "DirectPaid", message);
//             });
//           }
//         }
//       });
//     });

//     oxInstance.on(
//       "TreePayout",
//       async (receiverId, senderId, matrix, level, amount, time) => {
//         MyAllSubIds.forEach((subId) => {
//           const chatIds = SubIdAndChatId[subId];
//           if (chatIds) {
//             if (receiverId == subId) {
//               chatIds.forEach((chatId) => {
//                 const message = `Receiver Id => ${toNumber(
//                   receiverId
//                 )} | Sender ID => ${toNumber(senderId)} | Level => ${toNumber(
//                   level
//                 )} | Amount => ${toEth(amount)} | matrix => ${toNumber(
//                   matrix
//                 )}`;
//                 logAndSendMessage(chatId, "TreePayout", message);
//               });
//             }
//           }
//         });
//       }
//     );
//     oxInstance.on(
//       "Reinvest",
//       async (
//         reinvestUserId,
//         newUserId,
//         newCurrentReferrerId,
//         level,
//         reInvestCount,
//         time
//       ) => {
//         MyAllSubIds.forEach((subId) => {
//           const chatIds = SubIdAndChatId[subId];
//           if (chatIds) {
//             if (newUserId == subId) {
//               chatIds.forEach((chatId) => {
//                 const message = `reinvestUserId => ${toNumber(
//                   reinvestUserId
//                 )} | newUserId => ${toNumber(newUserId)} | Level => ${toNumber(
//                   level
//                 )} | newCurrentReferrerId => ${toNumber(newCurrentReferrerId)}`;
//                 logAndSendMessage(chatId, "Reinvest", message);
//               });
//             }
//           }
//         });
//       }
//     );
//     oxInstance.on(
//       "FreezeAmount",
//       async (freezeUserId, senderId, level, amount, time) => {
//         MyAllSubIds.forEach((subId) => {
//           const chatIds = SubIdAndChatId[subId];
//           if (chatIds) {
//             if (senderId == subId) {
//               chatIds.forEach((chatId) => {
//                 const message = `freezeUserId => ${toNumber(
//                   freezeUserId
//                 )} | senderId => ${toNumber(senderId)} | Level => ${toNumber(
//                   level
//                 )} | Amount => ${toEth(amount)}`;
//                 logAndSendMessage(chatId, "FreezeAmount", message);
//               });
//             }
//           }
//         });
//       }
//     );
//     oxInstance.on(
//       "NewUserPlace",
//       async (
//         sender,
//         userId,
//         referrerId,
//         level,
//         place,
//         reInvestCount,
//         originalReferrer,
//         time
//       ) => {
//         MyAllSubIds.forEach((subId) => {
//           const chatIds = SubIdAndChatId[subId];

//           if (chatIds) {
//             if (userId == subId) {
//               chatIds.forEach((chatId) => {
//                 const message = `sender => ${toNumber(
//                   sender
//                 )} | userId => ${toNumber(userId)} | Level => ${toNumber(
//                   level
//                 )} | referrerId => ${toNumber(
//                   referrerId
//                 )} | place => ${toNumber(place)} | reInvestCount => ${toNumber(
//                   reInvestCount
//                 )} | originalReferrer => ${toNumber(originalReferrer)}`;
//                 logAndSendMessage(chatId, "NewUserPlace", message);
//               });
//             }
//           }
//         });
//       }
//     );
//     oxInstance.on(
//       "FundsPassedUp",
//       async (receiverWhoMissedId, sender, level, amountMissed, time) => {
//         MyAllSubIds.forEach((subId) => {
//           const chatIds = SubIdAndChatId[subId];
//           if (chatIds) {
//             if (sender == subId) {
//               chatIds.forEach((chatId) => {
//                 const message = `sender => ${toNumber(
//                   sender
//                 )} | receiverWhoMissedId => ${toNumber(
//                   receiverWhoMissedId
//                 )} | Level => ${toNumber(level)} | amountMissed => ${toEth(
//                   amountMissed
//                 )}`;
//                 logAndSendMessage(chatId, "FundsPassedUp", message);
//               });
//             }
//           }
//         });
//       }
//     );
//     oxInstance.on(
//       "Upgrade",
//       async (msgSenderId, orignalRefId, currentRefId, level, time) => {
//         MyAllSubIds.forEach((subId) => {
//           const chatIds = SubIdAndChatId[subId];
//           if (chatIds) {
//             if (orignalRefId == subId) {
//               chatIds.forEach((chatId) => {
//                 const message = `msgSenderId => ${toNumber(
//                   msgSenderId
//                 )} | orignalRefId => ${toNumber(
//                   orignalRefId
//                 )} | Level => ${toNumber(level)} | currentRefId => ${toNumber(
//                   currentRefId
//                 )}`;
//                 logAndSendMessage(chatId, "Upgrade", message);
//               });
//             }
//           }
//         });
//       }
//     );
//   } catch (error) {
//     console.log("Error in listner Func ==> ", error);
//   }
// };

const ListenerFunction = async () => {
  try {
    const toNumber = (bigNumber) => ethers.BigNumber.from(bigNumber).toNumber();
    const logAndSendMessage = (chatId, eventType, message) => {
      sendMessage(chatId, `${eventType} :: ${message}`);
    };

    const provider = new ethers.providers.JsonRpcProvider(CONTRACT.rpcProvider);
    const signer = provider.getSigner();
    const oxInstance = new ethers.Contract(
      CONTRACT.contract_address,
      CONTRACT.oxABI,
      signer
    );

    const isEventActive = async (subId, eventName, chatId) => {
      let events = (await getDataFromChatId(chatId)).events;

      // let evt = events[0];
      // console.log("evt ==> " , events);

      if (events) {
        for (let index = 0; index < events.length; index++) {
          console.log("All sub Array => ", MyAllSubIds);
          if (MyAllSubIds[index] == subId) {
            const element = events[index];
            // console.log("Ele ==> ", element);

            console.log("Events ==> ", element[0][eventName]);
          }
        }
      }
    };

    MyAllSubIds.forEach((subId) => {
      isEventActive(1212, "Upgrade", userState.chatId);
    });

    // console.log("Called", MyAllSubIds);

    oxInstance.on(
      "Registration",
      async (newUserId, orignalRefId, currentRefId, time) => {
        MyAllSubIds.forEach((subId) => {
          const chatIds = SubIdAndChatId[subId];
          if (chatIds && isEventActive(subId, "New Partner")) {
            if (orignalRefId == subId) {
              chatIds.forEach((chatId) => {
                const message = `newUserId => ${toNumber(
                  newUserId
                )} | orignalRefId => ${toNumber(
                  orignalRefId
                )} | currentRefId => ${toNumber(currentRefId)}`;
                logAndSendMessage(chatId, "Registration", message);
              });
            }
          }
        });
      }
    );

    // DirectPaid Event Listener
    oxInstance.on("DirectPaid", async (to, from, amount, level, timeNow) => {
      MyAllSubIds.forEach((subId) => {
        const chatIds = SubIdAndChatId[subId];
        if (chatIds) {
          if (subId === to) {
            chatIds.forEach((chatId) => {
              const message = `to => ${toNumber(to)} | from => ${toNumber(
                from
              )} | Amount => ${toEth(amount)} | level => ${toNumber(level)}`;
              logAndSendMessage(chatId, "DirectPaid", message);
            });
          }
        }
      });
    });

    // TreePayout Event Listener
    oxInstance.on(
      "TreePayout",
      async (receiverId, senderId, matrix, level, amount, time) => {
        MyAllSubIds.forEach((subId) => {
          const chatIds = SubIdAndChatId[subId];
          if (chatIds && isEventActive(subId, "Place Activation")) {
            if (receiverId == subId) {
              chatIds.forEach((chatId) => {
                const message = `Receiver Id => ${toNumber(
                  receiverId
                )} | Sender ID => ${toNumber(senderId)} | Level => ${toNumber(
                  level
                )} | Amount => ${toEth(amount)} | matrix => ${toNumber(
                  matrix
                )}`;
                logAndSendMessage(chatId, "TreePayout", message);
              });
            }
          }
        });
      }
    );

    // Reinvest Event Listener
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
        MyAllSubIds.forEach((subId) => {
          const chatIds = SubIdAndChatId[subId];
          if (chatIds && isEventActive(subId, "Reinvest")) {
            if (newUserId == subId) {
              chatIds.forEach((chatId) => {
                const message = `reinvestUserId => ${toNumber(
                  reinvestUserId
                )} | newUserId => ${toNumber(newUserId)} | Level => ${toNumber(
                  level
                )} | newCurrentReferrerId => ${toNumber(newCurrentReferrerId)}`;
                logAndSendMessage(chatId, "Reinvest", message);
              });
            }
          }
        });
      }
    );

    // FreezeAmount Event Listener
    oxInstance.on(
      "FreezeAmount",
      async (freezeUserId, senderId, level, amount, time) => {
        MyAllSubIds.forEach((subId) => {
          const chatIds = SubIdAndChatId[subId];
          if (chatIds) {
            if (senderId == subId) {
              chatIds.forEach((chatId) => {
                const message = `freezeUserId => ${toNumber(
                  freezeUserId
                )} | senderId => ${toNumber(senderId)} | Level => ${toNumber(
                  level
                )} | Amount => ${toEth(amount)}`;
                logAndSendMessage(chatId, "FreezeAmount", message);
              });
            }
          }
        });
      }
    );

    // NewUserPlace Event Listener
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
        MyAllSubIds.forEach((subId) => {
          const chatIds = SubIdAndChatId[subId];

          if (chatIds && isEventActive(subId, "Place Activation")) {
            if (userId == subId) {
              chatIds.forEach((chatId) => {
                const message = `sender => ${toNumber(
                  sender
                )} | userId => ${toNumber(userId)} | Level => ${toNumber(
                  level
                )} | referrerId => ${toNumber(
                  referrerId
                )} | place => ${toNumber(place)} | reInvestCount => ${toNumber(
                  reInvestCount
                )} | originalReferrer => ${toNumber(originalReferrer)}`;
                logAndSendMessage(chatId, "NewUserPlace", message);
              });
            }
          }
        });
      }
    );

    // FundsPassedUp Event Listener
    oxInstance.on(
      "FundsPassedUp",
      async (receiverWhoMissedId, sender, level, amountMissed, time) => {
        MyAllSubIds.forEach((subId) => {
          const chatIds = SubIdAndChatId[subId];
          if (chatIds && isEventActive(subId, "Missed, Disabled Lavel")) {
            if (sender == subId) {
              chatIds.forEach((chatId) => {
                const message = `sender => ${toNumber(
                  sender
                )} | receiverWhoMissedId => ${toNumber(
                  receiverWhoMissedId
                )} | Level => ${toNumber(level)} | amountMissed => ${toEth(
                  amountMissed
                )}`;
                logAndSendMessage(chatId, "FundsPassedUp", message);
              });
            }
          }
        });
      }
    );

    // Upgrade Event Listener
    oxInstance.on(
      "Upgrade",
      async (msgSenderId, orignalRefId, currentRefId, level, time) => {
        MyAllSubIds.forEach((subId) => {
          const chatIds = SubIdAndChatId[subId];
          if (chatIds && isEventActive(subId, "Upgrade")) {
            if (orignalRefId == subId) {
              chatIds.forEach((chatId) => {
                const message = `msgSenderId => ${toNumber(
                  msgSenderId
                )} | orignalRefId => ${toNumber(
                  orignalRefId
                )} | Level => ${toNumber(level)} | currentRefId => ${toNumber(
                  currentRefId
                )}`;
                logAndSendMessage(chatId, "Upgrade", message);
              });
            }
          }
        });
      }
    );
  } catch (error) {
    console.log("Error in listener Func ==> ", error);
  }
};

//#region Contract Events 2.0

async function sendMessage(chatId, message) {
  // console.log("Chat Id ==>", chatId);
  try {
    await bot.telegram.sendMessage(chatId, message);
    // console.log(`Message sent to chat ID ${chatId}`);
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

bot.start(async (ctx) => {
  try {
    console.log("Bot Start ...");
    userState.language = (await getDataFromChatId(ctx.from.id)).language;
    console.log("Language ====> ", userState.language);
    userState.chatId = ctx.from.id;
    let res = await checkChatid(ctx.from.id);
    if (res == 200) {
      let language = userState.language;

      if (language == "TH") {
        await ctx.reply(
          "คุณได้ลงทะเบียนเรียบร้อยแล้ว \nใส่กระเป๋าสตางค์ / ID ของคุณ :",
          defaultMenu
        );
      } else {
        await ctx.reply(
          "You are already registered. \nEnter your wallet / ID :",
          defaultMenu
        );
      }

      MyAllSubIds = (await getDataFromChatId(ctx.from.id)).data;
      SUB_EVENT_ARR = (await getDataFromChatId(ctx.from.id)).events;

      console.log("Sub Event Err ==> ", SUB_EVENT_ARR);
      console.log("Sub Event Err ==> ", SUB_EVENT_ARR[0]);
      console.log("All my Sub Ids ==> ", MyAllSubIds);
      if (MyAllSubIds.length > 0) {
        for (const subIds of MyAllSubIds) {
          const chatIds = await getChatIdFromSubID(subIds);
          SubIdAndChatId[subIds] = chatIds;
        }
      }
      console.log("All my Sub Ids with chain Ids  ==> ", SubIdAndChatId);

      // await ctx.reply(messages[language].reply);
      // await ctx.reply(
      //   messages[language].welcome,
      //   getSubscriptionButtons(language)
      // );
    } else {
      await ctx.reply(
        "Select the language of the bot interface.(เลือกภาษาของอินเทอร์เฟซบอท.)",
        Markup.inlineKeyboard([
          [
            Markup.button.callback("EU", "language_selected_eng"),
            Markup.button.callback("TH", "language_selected_thai"),
          ],
        ])
      );
    }
  } catch (error) {
    console.error("Error while starting BOT:", error);
  }
});

const handleLanguageSelection = async (ctx, language) => {
  userState.chatId = ctx.from.id;
  userState.language = language;

  const messages = {
    [LANGUAGE_MODE_CONST.english]: {
      reply: "✅ Changes were successfully accepted",
      welcome:
        "Welcome!! \ntelegram bot sends you instant free notifications \nabout making profits, registering new partners and other important events in your account and the entire ecosystem. \n\nTo start using all the features of the Telegram bot, subscribe to the official Telegram channel at the link below.",
    },
    [LANGUAGE_MODE_CONST.thai]: {
      reply: "✅ การเปลี่ยนแปลงได้รับการยอมรับสำเร็จแล้ว",
      welcome:
        "ยินดีต้อนรับ!! \ntelegram bot จะส่งการแจ้งเตือนฟรีทันทีเกี่ยวกับการทำกำไร การลงทะเบียนพันธมิตรใหม่ และกิจกรรมสำคัญอื่นๆ ในบัญชีของคุณและระบบนิเวศทั้งหมด \n\nหากต้องการเริ่มใช้คุณสมบัติทั้งหมดของ Telegram bot ให้สมัครรับข้อมูลช่อง Telegram อย่างเป็นทางการที่ลิงก์ด้านล่าง",
    },
  };

  await ctx.reply(messages[language].reply);
  await ctx.reply(messages[language].welcome, getSubscriptionButtons(language));
};

bot.action("language_selected_eng", (ctx) =>
  handleLanguageSelection(ctx, LANGUAGE_MODE_CONST.english)
);

bot.action("language_selected_thai", (ctx) =>
  handleLanguageSelection(ctx, LANGUAGE_MODE_CONST.thai)
);

const getSubscriptionButtons = (language) => {
  if (language === LANGUAGE_MODE_CONST.thai) {
    return Markup.inlineKeyboard([
      [Markup.button.callback("สมัครสมาชิก @OurChannel", "add_subscription")],
      [
        Markup.button.callback(
          "ฉันสมัครสมาชิกเรียบร้อยแล้ว",
          "add_subscription"
        ),
      ],
    ]);
  }
  return Markup.inlineKeyboard([
    [Markup.button.callback("subscribe @OurChannel", "add_subscription")],
    [Markup.button.callback("I already subscribed", "add_subscription")],
  ]);
};

// Handler for subscription actions
bot.action("add_subscription", async (ctx) => {
  // userState.idFlag = true;
  const prompt =
    userState.language === LANGUAGE_MODE_CONST.thai
      ? "กรอกกระเป๋าสตางค์/รหัสประจำตัวของคุณ"
      : "Enter your wallet/id";
  await ctx.reply(prompt);
});

bot.hears("Accounts", async (ctx) => {
  let language = userState.language;
  let err;
  try {
    let allSubs = (await getDataFromChatId(ctx.from.id)).data;
    console.log("Length ==> ", allSubs);

    if (!Array.isArray(allSubs)) {
      console.error("allSubs is not an array:", allSubs);
      if (language == "TH") {
        return ctx.reply("เกิดข้อผิดพลาดในการดึงข้อมูลสมัครสมาชิก");
      } else {
        return ctx.reply("An error occurred fetching subscriptions.");
      }
    }

    let messageContent;
    if (allSubs) {
      if (language == "TH") {
        messageContent = `จำนวนการสมัครสมาชิก => ${allSubs.length} \n\n คลิกที่ ID ที่คุณสนใจเพื่อกำหนดค่าตัวกรองเหตุการณ์ \n`;
        err = `เกิดข้อผิดพลาดในการดึงข้อมูลสมัครสมาชิก`;
      } else {
        messageContent = `Number Of Subscription => ${allSubs.length} \n\n Click on the ID you are interested in to configure the event filter. \n`;
        err = `An error occurred fetching subscriptions.`;
      }
    } else {
      err = "No subscriptions found.";
    }

    // console.log("Account Chat Id all Subs =>", allSubs);

    let idButtons;
    if (allSubs) {
      idButtons = allSubs.map((id) => [
        Markup.button.callback(`ID => ${id}`, `select_${id}`),
      ]);
    }

    if (language == "TH") {
      idButtons.push([
        Markup.button.callback("เพิ่ม", "add_subscription"),
        Markup.button.callback("ลบ", "delete_subscription"),
      ]);
    } else {
      idButtons.push([
        Markup.button.callback("Add", "add_subscription"),
        Markup.button.callback("Delete", "delete_subscription"),
      ]);
    }

    await ctx.reply(messageContent.trim(), Markup.inlineKeyboard(idButtons));
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    err = error;
    ctx.reply(err);
  }
});

bot.action(/^select_(.+)$/, async (ctx) => {
  const chatId = ctx.from.id;
  const selectedId = ctx.match[1];
  let language = (await getDataFromChatId(chatId)).language;
  let msg;
  // console.log("Seleted Id in select => ", selectedId);
  let btns = [];
  if (language == "TH") {
    msg = `การตั้งค่าสำหรับ ID ${selectedId}`;
    btns = [
      [Markup.button.callback("ไม่รวมประเภทกิจกรรม", `ex_event_${selectedId}`)],
    ];
    btns.push([Markup.button.callback("กลับไป", "go_back")]);
  } else {
    msg = `Setting for ID ${selectedId}`;
    btns = [
      [Markup.button.callback("Exclude event type", `ex_event_${selectedId}`)],
    ];
    btns.push([Markup.button.callback("Go Back", "go_back")]);
  }

  await ctx.reply(msg, Markup.inlineKeyboard(btns));
});

// bot.action(/^ex_event_(.+)$/, async (ctx) => {
//   const chatId = ctx.from.chatId;
//   const selectedID = ctx.match[1];
//   let language = userState.language;
//   let idButtons, messageContent;
//   if (language == "TH") {
//     messageContent = `ปรับแต่งกิจกรรมของคุณสำหรับ ID ${selectedID} โดยเลือกเฉพาะกิจกรรมที่ถูกต้องเท่านั้น \n ✅ - เปิดใช้งาน \n ☑ - ไม่ได้เปิดใช้งาน`;
//     idButtons = EVENTS_ARR_THAI.map((evnt) => [
//       Markup.button.callback(`${evnt}`, `evnt_action_${selectedID}_${evnt}`),
//     ]);
//     idButtons.push([Markup.button.callback("กลับไป", `select_${selectedID}`)]);
//   } else {
//     messageContent = `Personalize your event for ID ${selectedID} by selection only the right ones. \n ✅ - Actived \n ☑ - Not Activated`;
//     idButtons = EVENTS_ARR.map((evnt) => [
//       Markup.button.callback(`${evnt}`, `evnt_action_${selectedID}_${evnt}`),
//     ]);
//     idButtons.push([Markup.button.callback("Go Back", `select_${selectedID}`)]);
//   }

//   await ctx.reply(messageContent.trim(), Markup.inlineKeyboard(idButtons));
// });

// bot.action(/^evnt_action_(.+)_(.+)$/, async (ctx) => {
//   const chatId = ctx.from.chatId;
//   const selectedID = ctx.match[1];
//   const selectedEvent = ctx.match[2];
//   let language = userState.language;

//   if (language == "TH") {
//     await ctx.reply(
//       `เลือก ID=> ${selectedID} , กิจกรรมที่เลือก -> ${selectedEvent}`
//     );
//   } else {
//     await ctx.reply(
//       `selected ID => ${selectedID} , selected Event -> ${selectedEvent}`
//     );
//   }
// });

// Example state object to track events per selectedID

let eventState = {};

const generateButtons = async (selectedID, eventsArr, language, chatId) => {
  console.log("CCCCC ===> ", chatId);
  const evDataResponse = await getDataFromChatId(chatId);
  let MyAllSubIds = evDataResponse.data;
  let count = 0;
  console.log("Se , MA", MyAllSubIds.length);

  for (let index = 0; index < MyAllSubIds.length; index++) {
    console.log("Se , MA", selectedID, MyAllSubIds[index]);

    if (MyAllSubIds[index] == selectedID) {
      break;
    }
    count++;
  }

  const evData = evDataResponse.events[count];

  console.log("EvData ?? ==> ", evData, count);

  const eventButtons = eventsArr.map((evnt) => {
    const isActive = evData[0][evnt];
    // console.log("Us Active ==> ", evData[0][evnt]);

    const icon = isActive ? "✅" : "✔️";
    return Markup.button.callback(
      `${evnt} ${icon}`,
      `evnt_action_${selectedID}_${evnt}`
    );
  });

  // Add "Go Back" button at the end
  const goBackButton =
    language === "TH"
      ? Markup.button.callback("กลับไป", `select_${selectedID}`)
      : Markup.button.callback("Go Back", `select_${selectedID}`);

  return [...eventButtons.map((btn) => [btn]), [goBackButton]];
};

bot.action(/^ex_event_(.+)$/, async (ctx) => {
  const chatId = ctx.from.id;
  const selectedID = ctx.match[1];
  let language = (await getDataFromChatId(chatId)).language;

  let messageContent;
  let idButtons;

  if (language === "TH") {
    messageContent = `ปรับแต่งกิจกรรมของคุณสำหรับ ID ${selectedID} โดยเลือกเฉพาะกิจกรรมที่ถูกต้องเท่านั้น \n ✅ - เปิดใช้งาน \n ☑ - ไม่ได้เปิดใช้งาน`;
    idButtons = await generateButtons(
      selectedID,
      EVENTS_ARR_THAI,
      language,
      chatId
    );
  } else {
    messageContent = `Personalize your event for ID ${selectedID} by selecting only the right ones. \n ✅ - Activated \n ✔️ - Not Activated`;
    idButtons = await generateButtons(selectedID, EVENTS_ARR, language, chatId);
  }

  await ctx.reply(messageContent.trim(), Markup.inlineKeyboard(idButtons));
});

// bot.action(/^evnt_action_(.+)_(.+)$/, async (ctx) => {
//   const chatID = ctx.from.id;
//   const selectedID = ctx.match[1];
//   const eventName = ctx.match[2];
//   const language = userState.language;

//   if (eventState[selectedID]) {
//     eventState[selectedID][eventName] = !eventState[selectedID][eventName];
//   } else {
//     eventState[selectedID] = { [eventName]: true };
//   }

//   // console.log("chatId ===> ", chatID);
//   // console.log("Selected id ===> ", selectedID);
//   // console.log("Events ===> ", eventState);

//   let evt = eventState[selectedID];

//   const res = await editData({
//     chat_id: chatID,
//     subscriber_id: selectedID,
//     events: evt,
//   });

//   await ctx.answerCbQuery();
//   await ctx.reply(
//     language === "TH"
//       ? `ปรับแต่งกิจกรรมของคุณสำหรับ ID ${selectedID} โดยเลือกเฉพาะกิจกรรมที่ถูกต้องเท่านั้น \n ✅ - เปิดใช้งาน \n ☑ - ไม่ได้เปิดใช้งาน`
//       : `Personalize your event for ID ${selectedID} by selecting only the right ones. \n ✅ - Activated \n ✔️ - Not Activated.`,
//     Markup.inlineKeyboard(
//       await generateButtons(
//         selectedID,
//         language === "TH" ? EVENTS_ARR_THAI : EVENTS_ARR,
//         language,
//         chatID
//       )
//     )
//   );
// });

bot.action(/^evnt_action_(.+)_(.+)$/, async (ctx) => {
  const chatID = ctx.from.id;
  const selectedID = ctx.match[1];
  const eventName = ctx.match[2];
  const language = userState.language;

  // Fetch the current state of events from the API
  const eventDataResponse = (await getDataFromChatId(chatID)).events;
  let eventStates = eventDataResponse[0]; // Assuming the first element contains the relevant event data

  console.log(
    "before EvnStss ==>> ",
    eventStates[0][eventName],
    eventStates[0],
    eventName
  );

  if (eventStates[0][eventName]) {
    eventStates[0][eventName] = false;
  } else {
    eventStates[0][eventName] = true;
  }
  console.log(
    "After EvnStss ==>> ",
    eventStates[0][eventName],
    eventStates[0],
    eventName
  );

  // Send the updated state back to the API for persistence
  const res = await editData({
    chat_id: chatID,
    subscriber_id: selectedID,
    events: eventStates[0],
  });

  await ctx.answerCbQuery();

  // Generate buttons based on the updated state and reply to the user
  await ctx.reply(
    language === "TH"
      ? `ปรับแต่งกิจกรรมของคุณสำหรับ ID ${selectedID} โดยเลือกเฉพาะกิจกรรมที่ถูกต้องเท่านั้น \n ✅ - เปิดใช้งาน \n ☑ - ไม่ได้เปิดใช้งาน`
      : `Personalize your event for ID ${selectedID} by selecting only the right ones. \n ✅ - Activated \n ✔️ - Not Activated.`,
    Markup.inlineKeyboard(
      await generateButtons(
        selectedID,
        language === "TH" ? EVENTS_ARR_THAI : EVENTS_ARR,
        language,
        chatID
      )
    )
  );
});

bot.action("delete_subscription", async (ctx) => {
  try {
    let chatId = ctx.from.id;
    let allSubs = (await getDataFromChatId(ctx.from.id)).data;
    let language = userState.language;
    let err, msg, gb;

    if (language == "TH") {
      err = "เกิดข้อผิดพลาดในการดึงข้อมูลสมัครสมาชิก";
      msg = "เลือกบัญชีที่คุณต้องการลบ📤.";
      gb = "กลับไป";
    } else {
      err = "An error occurred fetching subscriptions.";
      msg = "Select the account you want to delete.📤";
      gb = "Go Back";
    }

    if (!Array.isArray(allSubs)) {
      console.error("allSubs is not an array:", allSubs);
      return ctx.reply(err);
    }

    // console.log("Account Chat Id all Subs =>", allSubs);

    const idButtons = allSubs.map((id) => [
      Markup.button.callback(`ID => ${id}`, `delete_id_${id}`),
    ]);

    idButtons.push([Markup.button.callback(gb, "go_back")]);

    await ctx.reply(msg.trim(), Markup.inlineKeyboard(idButtons));
  } catch (error) {
    console.log("Error in delete sub Ids ==>", error);
  }
});

bot.action(/^delete_id_(.+)$/, async (ctx) => {
  let chatId = ctx.from.id;
  const selectedId = ctx.match[1];
  let language = userState.language;
  let msg;

  if (language == "TH") {
    msg = `✔ รหัส ${selectedId} ของคุณถูกลบเรียบร้อยแล้ว`;
  } else {
    msg = `✔ Your Id ${selectedId} is Successfully deleted.`;
  }

  try {
    let res = await deleteChatId(chatId, selectedId);
    // console.log("Res ===>>", res);

    if (res.status) {
      await ctx.reply(msg);
    } else {
      await ctx.reply(`❌ ${res.data}.`);
    }
  } catch (error) {}

  // Implement additional logic for handling selected ID
});

bot.action("go_back", async (ctx) => {
  let language = userState.language;
  let err, msg;
  let allSubs = (await getDataFromChatId(ctx.from.id)).data;

  if (allSubs) {
    if (language == "TH") {
      err = "เกิดข้อผิดพลาดในการดึงข้อมูลสมัครสมาชิก";
      msg = `จำนวนการสมัครสมาชิก => ${allSubs.length} \n\n คลิกที่ ID ที่คุณสนใจเพื่อกำหนดค่าตัวกรองเหตุการณ์ \n`;
    } else {
      err = "An error occurred fetching subscriptions.";
      msg = `Number Of Subscription => ${allSubs.length} \n\n Click on the ID you are interested in to configure the event filter. \n`;
    }
  } else {
    err = "No subscriptions found.";
  }
  try {
    if (!Array.isArray(allSubs)) {
      console.error("allSubs is not an array:", allSubs);
      return ctx.reply(err);
    }

    let messageContent = msg;

    // console.log("Account Chat Id all Subs =>", allSubs);

    const idButtons = allSubs.map((id) => [
      Markup.button.callback(`ID => ${id}`, `select_${id}`),
    ]);

    if (language == "TH") {
      idButtons.push([
        Markup.button.callback("เพิ่ม", "add_subscription"),
        Markup.button.callback("ลบ", "delete_subscription"),
      ]);
    } else {
      idButtons.push([
        Markup.button.callback("Add", "add_subscription"),
        Markup.button.callback("Delete", "delete_subscription"),
      ]);
    }

    await ctx.reply(messageContent.trim(), Markup.inlineKeyboard(idButtons));
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    ctx.reply(err);
  }
});

bot.action("change_language", async (ctx) => {
  const chatId = ctx.from.id;

  const btn = Markup.inlineKeyboard([
    [
      Markup.button.callback("EU", "language_selected_eng"),
      Markup.button.callback("TH", "language_selected_thai"),
    ],
    [Markup.button.callback("Go Back", "go_back_lang")],
  ]);

  await ctx.reply(
    "Select the language of the bot interface.(เลือกภาษาของอินเทอร์เฟซบอท.)",
    btn
  );
});

bot.action("go_back_lang", async (ctx) => {
  let language = userState.language;
  let msg, btn;
  if (language == "TH") {
    msg = "การตั้งค่าทั่วไปของบัญชีของคุณ";
    btn = Markup.inlineKeyboard([
      [Markup.button.callback("ภาษา", "change_language")],
      [Markup.button.callback("กลับไป", "go_back")],
    ]);
  } else {
    msg = "General Setting of your account";
    btn = Markup.inlineKeyboard([
      [Markup.button.callback("Language", "change_language")],
      [Markup.button.callback("Go Back", "go_back")],
    ]);
  }
  ctx.reply(msg.trim(), btn);
});

bot.hears("Settings", async (ctx) => {
  // const chat_id = ctx.from.id;
  let language = userState.language;
  let msg, btn;
  if (language == "TH") {
    msg = "การตั้งค่าทั่วไปของบัญชีของคุณ";
    btn = Markup.inlineKeyboard([
      [Markup.button.callback("ภาษา", "change_language")],
      [Markup.button.callback("กลับไป", "go_back")],
    ]);
  } else {
    msg = "General Setting of your account";
    btn = Markup.inlineKeyboard([
      [Markup.button.callback("Language", "change_language")],
      [Markup.button.callback("Go Back", "go_back")],
    ]);
  }
  ctx.reply(msg.trim(), btn);
});

bot.on("text", async (ctx) => {
  const chatId = ctx.from.id;
  const txt = ctx.message.text;
  let lag1 = userState.language;
  let language = (await getDataFromChatId(chatId)).language;
  // let language = userState.language;

  console.log("Chat ID:", chatId);
  console.log("Text:", txt);
  console.log("Language:", lag1);

  const defaultEvents = {
    "Place Activation": true,
    Upgrade: true,
    Reinvest: true,
    "Missed, Disabled Lavel": true,
    "New Partner": true,
  };

  if (chatId && lag1 && txt) {
    try {
      const result = await insertData({
        chat_id: chatId,
        language: lag1,
        subscriber_id: txt,
        events: defaultEvents,
      });

      let responseMessage;
      if (result.status) {
        responseMessage =
          userState.language === LANGUAGE_MODE_CONST.thai
            ? "✅ บันทึก ID ของคุณเรียบร้อยแล้ว"
            : "✅ Your ID has been successfully recorded.";
      } else {
        if (result.message === "Already exist") {
          responseMessage =
            userState.language === LANGUAGE_MODE_CONST.thai
              ? "✔️ID นี้มีอยู่แล้ว"
              : "✔️ This ID already exists.";
        } else if (result.message === "Subcriber Id Invalid") {
          responseMessage =
            userState.language === LANGUAGE_MODE_CONST.thai
              ? "✔️ รหัสสมาชิกไม่ถูกต้อง"
              : "✔️ Subcriber Id Invalid.";
        } else {
          responseMessage =
            userState.language === LANGUAGE_MODE_CONST.thai
              ? "❌ มีบางอย่างผิดพลาด โปรดลองอีกครั้ง"
              : "❌ Something went wrong. Please try again.";
        }
      }

      await ctx.reply(responseMessage, defaultMenu);
    } catch (error) {
      console.error("Error processing text message:", error);
      await ctx.reply(
        userState.language === LANGUAGE_MODE_CONST.thai
          ? "❌ เกิดข้อผิดพลาด โปรดลองอีกครั้ง"
          : "❌ An error occurred. Please try again."
      );
    }
  } else {
    await ctx.reply(
      userState.language === LANGUAGE_MODE_CONST.thai
        ? "กรุณาเลือกภาษาจากการตั้งค่าก่อน"
        : "Please select the language first from setting."
    );
  }
});

bot.launch(() => {
  console.log("bot is live!!!!!");
});
ListenerFunction().then(() => {
  console.log("contract event listening....");
});
setInterval(ListenerFunction, 3000);
