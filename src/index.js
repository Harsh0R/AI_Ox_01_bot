import { Telegraf, Markup } from "telegraf";
import CONTRACT from "./constant.js";
import {
  checkChatid,
  deleteChatId,
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
let SubIdAndChatId = {};
let MyAllSubIds = [];
// const chatIdOfSub = [];
//#region Contract Events

const ListenerFunction = async () => {
  try {
    // MyAllSubIds = (await getDataFromChatId(userState.chatId)).data;
    // console.log("All my Sub Ids ==> ", MyAllSubIds);
    // if (MyAllSubIds.length > 0) {
    //   for (const subIds of MyAllSubIds) {
    //     const chatIds = await getChatIdFromSubID(subIds);
    //     SubIdAndChatId[subIds] = chatIds;
    //   }
    // }
    const toNumber = (bigNumber) => ethers.BigNumber.from(bigNumber).toNumber();
    const logAndSendMessage = (chatId, eventType, message) => {
      // console.log(`Chat Id => ${chatId} | ${eventType} :: ${message}`);
      sendMessage(chatId, `${eventType} :: ${message}`);
    };

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
        MyAllSubIds.forEach((subId) => {
          const chatIds = SubIdAndChatId[subId];
          if (chatIds) {
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

    oxInstance.on(
      "TreePayout",
      async (receiverId, senderId, matrix, level, amount, time) => {
        MyAllSubIds.forEach((subId) => {
          const chatIds = SubIdAndChatId[subId];
          if (chatIds) {
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
          if (chatIds) {
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

          if (chatIds) {
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
    oxInstance.on(
      "FundsPassedUp",
      async (receiverWhoMissedId, sender, level, amountMissed, time) => {
        MyAllSubIds.forEach((subId) => {
          const chatIds = SubIdAndChatId[subId];
          if (chatIds) {
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
    oxInstance.on(
      "Upgrade",
      async (msgSenderId, orignalRefId, currentRefId, level, time) => {
        MyAllSubIds.forEach((subId) => {
          const chatIds = SubIdAndChatId[subId];
          if (chatIds) {
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
    console.log("Error in listner Func ==> ", error);
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
  try {
    let allSubs = (await getDataFromChatId(ctx.from.id)).data;

    if (!Array.isArray(allSubs)) {
      console.error("allSubs is not an array:", allSubs);
      if (language == "EU") {
        return ctx.reply("An error occurred fetching subscriptions.");
      } else {
        return ctx.reply("เกิดข้อผิดพลาดในการดึงข้อมูลสมัครสมาชิก");
      }
    }
    let messageContent, err;
    if (language == "TH") {
      messageContent = `จำนวนการสมัครสมาชิก => ${allSubs.length} \n\n คลิกที่ ID ที่คุณสนใจเพื่อกำหนดค่าตัวกรองเหตุการณ์ \n`;
      err = `เกิดข้อผิดพลาดในการดึงข้อมูลสมัครสมาชิก`;
    } else {
      messageContent = `Number Of Subscription => ${allSubs.length} \n\n Click on the ID you are interested in to configure the event filter. \n`;
      err = `An error occurred fetching subscriptions.`;
    }

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

bot.action(/^select_(.+)$/, async (ctx) => {
  const chatId = ctx.from.id;
  const selectedId = ctx.match[1];
  let language = userState.language;
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

const generateButtons = (selectedID, eventsArr) => {
  return eventsArr.map((evnt) => {
    const isActive = eventState[selectedID][evnt];
    const icon = isActive ? "✅" : "✔️";
    return [
      Markup.button.callback(
        `${evnt} ${icon}`,
        `evnt_action_${selectedID}_${evnt}`
      ),
    ];
  });
};

bot.action(/^ex_event_(.+)$/, async (ctx) => {
  const chatId = ctx.from.id;
  const selectedID = ctx.match[1];
  let language = userState.language;

  // Initialize event state for selectedID if not already present
  if (!eventState[selectedID]) {
    eventState[selectedID] = EVENTS_ARR.reduce((acc, evnt) => {
      acc[evnt] = true; // All events initially active
      return acc;
    }, {});
  }

  let messageContent;
  let idButtons;

  if (language === "TH") {
    messageContent = `ปรับแต่งกิจกรรมของคุณสำหรับ ID ${selectedID} โดยเลือกเฉพาะกิจกรรมที่ถูกต้องเท่านั้น \n ✅ - เปิดใช้งาน \n ☑ - ไม่ได้เปิดใช้งาน`;
    idButtons = generateButtons(selectedID, EVENTS_ARR_THAI);
    idButtons.push([Markup.button.callback("กลับไป", `select_${selectedID}`)]);
  } else {
    messageContent = `Personalize your event for ID ${selectedID} by selecting only the right ones. \n ✅ - Activated \n ✔️ - Not Activated`;
    idButtons = generateButtons(selectedID, EVENTS_ARR);
    idButtons.push([Markup.button.callback("Go Back", `select_${selectedID}`)]);
  }

  await ctx.reply(messageContent.trim(), Markup.inlineKeyboard(idButtons));
});

bot.action(/^evnt_action_(.+)_(.+)$/, async (ctx) => {
  const selectedID = ctx.match[1];
  const eventName = ctx.match[2];

  // Toggle event state
  if (eventState[selectedID]) {
    eventState[selectedID][eventName] = !eventState[selectedID][eventName];
  } else {
    eventState[selectedID] = { [eventName]: true };
  }

  console.log("Events ===> ", eventState);

  await ctx.answerCbQuery();
  await ctx.editMessageText(
    `Personalize your event for ID ${selectedID} by selecting only the right ones. \n ✅ - Activated \n ✔️ - Not Activated.`,
    Markup.inlineKeyboard(
      generateButtons(
        selectedID,
        userState.language === "TH" ? EVENTS_ARR_THAI : EVENTS_ARR
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

  if (language == "TH") {
    err = "เกิดข้อผิดพลาดในการดึงข้อมูลสมัครสมาชิก";
    msg = `จำนวนการสมัครสมาชิก => ${allSubs.length} \n\n คลิกที่ ID ที่คุณสนใจเพื่อกำหนดค่าตัวกรองเหตุการณ์ \n`;
  } else {
    err = "An error occurred fetching subscriptions.";
    msg = `Number Of Subscription => ${allSubs.length} \n\n Click on the ID you are interested in to configure the event filter. \n`;
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
  let language = (await getDataFromChatId(chatId)).language;
  console.log("LANGUAGE ==> ", chatId);
  console.log("LANGUAGE ==> ", txt);
  console.log("LANGUAGE ==> ", language);

  if (chatId && language && txt) {
    const result = await insertData({
      chat_id: chatId,
      language: language,
      subscriber_id: txt,
    });

    const defaultEvents = {
      "Place Activation": true,
      Upgrade: true,
      Reinvest: true,
      "Missed, Disabled Lavel": true,
      "New Partner": true,
    };

    console.log("chat====>:>", chatId);
    console.log("txt====>:>", txt);
    console.log("deff====>:>", defaultEvents);

    // const result1 = await saveOrUpdateSubscription(chatId, txt, defaultEvents);

    let responseMessage;

    if (result.status) {
      responseMessage =
        userState.language === LANGUAGE_MODE_CONST.thai
          ? "✅ บันทึก ID ของคุณเรียบร้อยแล้ว"
          : "✅ Your ID has been successfully recorded.";
    } else {
      // Handle the case where the data already exists
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
        // Handle other failure scenarios
        responseMessage =
          userState.language === LANGUAGE_MODE_CONST.thai
            ? "❌ มีบางอย่างผิดพลาด โปรดลองอีกครั้ง"
            : "❌ Something went wrong. Please try again.";
      }
    }

    await ctx.reply(responseMessage, defaultMenu);
  } else {
    await ctx.reply(
      userState.language === LANGUAGE_MODE_CONST.thai
        ? "กรุณาเลือกภาษาจากการตั้งค่าก่อน"
        : "Please select the language first from setting."
    );
  }

  const result = await getDataFromChatId(ctx.from.id);
  const MyAllSubIds1 = result ? result.data : [];
  MyAllSubIds = MyAllSubIds1;
  console.log("All my Sub Ids ==> ", MyAllSubIds);

  if (MyAllSubIds.length > 0) {
    for (const subId of MyAllSubIds) {
      const chatIds = await getChatIdFromSubID(subId);
      SubIdAndChatId[subId] = chatIds;
    }
  }

  // console.log(" Id and Chat Id Mapping ===>>> ", SubIdAndChatId);
});

bot.launch(() => {
  console.log("bot is live!!!!!");
});
ListenerFunction().then(() => {
  console.log("contract event listening....");
});
setInterval(ListenerFunction, 1000);
