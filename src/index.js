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
import logError from "./logger.js";
import "dotenv/config";

const bot = new Telegraf(process.env.TELEGRAF_TOKEN);

const LANGUAGE_MODE_CONST = {
  english: "EN",
  thai: "TH",
};

let userState = {
  chatId: null,
  language: null,
  // idFlag: true,
};
let CHATID = null;
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

let preMsg = ''
let preMsgRe = ''
let preMsgTP = ''

//#region Contract Events

async function sendMessage(chatId, message) {
  try {
    await bot.telegram.sendMessage(chatId, message, {
      parse_mode: "HTML",
    });
  } catch (error) {
    logError(`Failed to send message to chat ID ${chatId}:`, error);
    console.error(`Failed to send message to chat ID ${chatId}:`, error);
  }
}

function toEth(amount, decimal = 18) {
  const toEth = ethers.utils.formatUnits(amount, decimal);
  return toEth.toString();
}

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

    const isEventActive = async (subId, eventName) => {
      let chatId = CHATID;
      let events = (await getDataFromChatId(chatId)).events;
      let MyAllSubIds = (await getDataFromChatId(chatId)).data;
      let fleg = true;
      if (events && MyAllSubIds) {
        for (let index = 0; index < events.length; index++) {
          // console.log("All sub Array => ", MyAllSubIds);
          if (MyAllSubIds[index] == subId) {
            const element = events[index];
            fleg = element[0][eventName];
            // console.log("Events ==> ", element[0][eventName]);
          }
        }
      }
      return fleg;
    };

    oxInstance.on(
      "Registration",
      async (newUserId, orignalRefId, currentRefId, time) => {
        // const chatIds = SubIdAndChatId[subId];
        const message = `
                ID ${toNumber(orignalRefId)}: You've got a new partner!
                \nYour new partner received ID ${toNumber(newUserId)}.
                `;
                if (preMsgRe != message) {
                  logAndSendMessage(CHATID, "Registration", message);
                  preMsgRe = message;
                }

        MyAllSubIds.forEach((subId) => {
          const chatIds = SubIdAndChatId[subId];
          if (chatIds && isEventActive(subId, "New Partner")) {
            if (orignalRefId == subId) {
              chatIds.forEach((chatId) => {
                const message = `
                ID ${toNumber(orignalRefId)}: You've got a new partner!
                \nYour new partner received ID ${toNumber(newUserId)}.
                `;
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
        const message = `ID ${toNumber(receiverId)}: ➕${toEth(amount)} OC  
        Level: ${toNumber(level)}
        From partner: ID ${toNumber(senderId)} 
        <a href="https://polygonscan.com/address/0x865Ec7e50872B0Fd5322640fA41920d515B2f4e6">[See transaction]</a>
        `;

        if (preMsgTP != message) {
          logAndSendMessage(CHATID, "TreePayout", message);
          preMsgTP = message
        }

        MyAllSubIds.forEach((subId) => {
          const chatIds = SubIdAndChatId[subId];
          if (chatIds && isEventActive(subId, "Place Activation")) {
            if (receiverId == subId) {
              chatIds.forEach((chatId) => {
                const message = `ID ${toNumber(receiverId)}: ➕${toEth(
                  amount
                )} OC  
                Level: ${toNumber(level)}
                From partner: ID ${toNumber(senderId)} 
                <a href="https://polygonscan.com/address/0x865Ec7e50872B0Fd5322640fA41920d515B2f4e6">[See transaction]</a>
                `;
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
                const message = `
                ID ${toNumber(reinvestUserId)}: 🔁 Recycle 
                Level: ${toNumber(level)} 
                Level automatically started again. 
                <a href="https://polygonscan.com/address/0x865Ec7e50872B0Fd5322640fA41920d515B2f4e6">[See transaction]</a>
                `;
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


        const message = `msgSenderId => ${toNumber(
          msgSenderId
        )} | orignalRefId => ${toNumber(
          orignalRefId
        )} | Level => ${toNumber(level)} | currentRefId => ${toNumber(
          currentRefId
        )}`;
        if (preMsg != message) {
          logAndSendMessage(CHATID, "Upgrade", message);
          preMsg = message
        }

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

    await new Promise((resolve) => setTimeout(resolve, 2000));
  } catch (error) {
    logError("Error Listenning Events Function : ", error);
    // console.log("Error in listener Func ==> ", error);
  }
};

// region Bot region

const defaultMenu = Markup.keyboard([["Accounts", "Settings"]]).resize();

bot.start(async (ctx) => {
  try {
    CHATID = ctx.from.id;
    userState.chatId = ctx.from.id;
    let res = await checkChatid(ctx.from.id);

    if (res == 200) {
      let language = (await getDataFromChatId(ctx.from.id)).language;
      userState.language = language;

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

      if (MyAllSubIds.length > 0) {
        for (const subIds of MyAllSubIds) {
          const chatIds = await getChatIdFromSubID(subIds);
          SubIdAndChatId[subIds] = chatIds;
        }
      }
    } else {
      await ctx.reply(
        "Select the language of the bot interface.(เลือกภาษาของอินเทอร์เฟซบอท.)",
        Markup.inlineKeyboard([
          [
            Markup.button.callback("EN", "language_selected_eng"),
            Markup.button.callback("TH", "language_selected_thai"),
          ],
        ])
      );
    }
  } catch (error) {
    logError("Error while starting BOT:", error);
    console.error("Error while starting BOT:", error);
  }
});

const handleLanguageSelection = async (ctx, language) => {
  userState.chatId = ctx.from.id;
  userState.language = language;
  // console.log("user.lang ==>", userState.language);

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

  await ctx.reply(messages[language].reply, defaultMenu);
  await ctx.reply(messages[language].welcome, getSubscriptionButtons(language));
};

bot.action("language_selected_eng", (ctx) => {
  userState.language = "EN";
  handleLanguageSelection(ctx, LANGUAGE_MODE_CONST.english);
});

bot.action("language_selected_thai", (ctx) => {
  userState.language = "TH";
  handleLanguageSelection(ctx, LANGUAGE_MODE_CONST.thai);
});

const getSubscriptionButtons = (language) => {
  userState.language = language;
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

bot.action("add_subscription", async (ctx) => {
  // userState.idFlag = true;
  // userState.language = (await getDataFromChatId(ctx.from.id)).language;
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
    if (!Array.isArray(allSubs)) {
      // console.error("allSubs is not an array:", allSubs);
      if (language == "TH") {
        logError(
          "An error occurred fetching subscriptions.",
          'In bot.hears("Accounts")'
        );
        return ctx.reply("ไม่พบการสมัครสมาชิก.");
      } else {
        logError(
          "An error occurred fetching subscriptions.",
          'In bot.hears("Accounts")'
        );
        return ctx.reply("No subscriptions found.");
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
      if (language == "TH") {
        err = `ไม่พบการสมัครสมาชิก.`;
      } else {
        err = "No subscriptions found.";
      }
    }
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
    logError("Error fetching data in bot.hears=>Accounts.", error);
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

const generateButtons = async (selectedID, eventsArr, language, chatId) => {
  const evDataResponse = await getDataFromChatId(chatId);
  let MyAllSubIds = evDataResponse.data;
  let count = 0;
  for (let index = 0; index < MyAllSubIds.length; index++) {
    if (MyAllSubIds[index] == selectedID) {
      break;
    }
    count++;
  }

  const evData = evDataResponse.events[count];

  const eventButtons = eventsArr.map((evnt) => {
    const isActive = evData[0][evnt];
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

bot.action(/^evnt_action_(.+)_(.+)$/, async (ctx) => {
  const chatID = ctx.from.id;
  const selectedID = ctx.match[1];
  const eventName = ctx.match[2];
  const language = userState.language;
  const evDataResponse = await getDataFromChatId(chatID);
  let MyAllSubIds = evDataResponse.data;
  let eventDataResponse = evDataResponse.events;
  let count = 0;

  for (let index = 0; index < MyAllSubIds.length; index++) {
    // console.log("Se , MA", selectedID, MyAllSubIds[index]);

    if (MyAllSubIds[index] == selectedID) {
      break;
    }
    count++;
  }

  let eventStates = eventDataResponse[count];

  // console.log(
  //   "before EvnStss ==>> ",
  //   eventStates[0][eventName],
  //   eventStates[0],
  //   eventName
  // );

  if (eventStates[0][eventName]) {
    eventStates[0][eventName] = false;
  } else {
    eventStates[0][eventName] = true;
  }
  // console.log(
  //   "After EvnStss ==>> ",
  //   eventStates[0][eventName],
  //   eventStates[0],
  //   eventName
  // );

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
      // console.error("allSubs is not an array:", allSubs);
      return ctx.reply(err);
    }

    const idButtons = allSubs.map((id) => [
      Markup.button.callback(`ID => ${id}`, `delete_id_${id}`),
    ]);

    idButtons.push([Markup.button.callback(gb, "go_back")]);

    await ctx.reply(msg.trim(), Markup.inlineKeyboard(idButtons));
  } catch (error) {
    logError("Error in delete sub Ids ==> ", error);
    // console.log("Error in delete sub Ids ==>", error);
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

    if (res.status) {
      await ctx.reply(msg);
    } else {
      await ctx.reply(`❌ ${res.data}.`);
    }
  } catch (error) {
    logError("Error After delete sub Ids ==> ", error);
  }

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
    if (language == "TH") {
      err = `ไม่พบการสมัครสมาชิก.`;
    } else {
      err = "No subscriptions found.";
    }
  }
  try {
    if (!Array.isArray(allSubs)) {
      // console.error("allSubs is not an array:", allSubs);
      return ctx.reply(err);
    }

    let messageContent = msg;

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
    logError("Error in Go Back ==> ", error);
    console.error("Error fetching subscriptions:", error);
    ctx.reply(err);
  }
});

bot.action("change_language", async (ctx) => {
  const chatId = ctx.from.id;

  const btn = Markup.inlineKeyboard([
    [
      Markup.button.callback("EN", "language_selected_eng"),
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

  let lag1 = userState.language || language;
  // console.log("LLLLLLLLLLLLL=====>>>", userState);
  // console.log("LLLLLLLLLLLLL=====>>>", language);

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
const runListenerWithInterval = async () => {
  while (true) {
    await ListenerFunction();
    console.log("contract event listening....");
    await new Promise((resolve) => setTimeout(resolve, 3000));
  }
};

runListenerWithInterval();
