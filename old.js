import { Telegraf, Markup } from "telegraf";
import axios from "axios";
import "dotenv/config";
import CONTRACT from "./constant.js";
import { ethers, Signer } from "ethers";

try {
  //#region CONSTANTS,MENUES

  const BASE_URL = process.env.BASE_URL;

  let IDS = [];
  let ID_ADD_FLAG = false;
  let ID_DELETE_FLAG = false;
  let CHAT_IDS = [];
  let SUB_IDS = [];
  let LANGUAGE_MODE_FLAG;
  const LANGUAGE_MODE_CONST = {
    english: "EU",
    hindi: "HD",
  };

  const bot = new Telegraf(process.env.TELEGRAM_URL);
  //bot.use(Telegraf.log()); // turn on to see logs

  const defaultMenu = Markup.keyboard([["Accounts", "Settings"]])
    .resize()
    .oneTime();

  //#endregion

  //#region APIS

  const insertData = async (data) => {
    try {
      console.log("insert data ===>>", data);
      if (data.chat_id && data.language && data.subscriber_id) {
        const form = new FormData();
        form.append("chat_id", data.chat_id);
        form.append("language", data.language);
        form.append("subscriber_id", data.subscriber_id);
        console.log("Form ===>>", form);
        const response = await axios.post(
          "https://thecrypto360.com/notifier_bot/storedata.php",
          form,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        console.log("Add respo ==> ", response.data);
        // fetchData(1);
        return { status: true, data: response.data };
      } else {
        return { status: false, data: null };
      }
    } catch (error) {
      console.error("Error in set data =====>?>>>>>", error);
      return { status: false, data: null };
    }
  };

  const fetchData = async (data) => {
    try {
      console.log("Acclleddd -=--=>", data);
      const form = new FormData();
      form.append("subscriber_id", data);
      console.log("Form in Fetch Data ==:> ", form);
      const response = await axios.post(
        "https://thecrypto360.com/notifier_bot/getchat_id.php",
        form,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      const chatIds = response.data.data.map((item) => item.chat_id);
      console.log("Chat Id List ==> ", chatIds);
      CHAT_IDS = chatIds;

      return chatIds;
    } catch (error) {
      console.error("Error in Fetch Data  ======>>>>> ", error);
      return { status: false, data: null };
    }
  };

  const fetchSubIds = async (data) => {
    try {
      console.log("Acclleddd -=--=>", data);
      const form = new FormData();
      form.append("chat_id", data);
      console.log("Form in Fetch Data ==:> ", form);
      const response = await axios.post(
        "https://thecrypto360.com/notifier_bot/getsubscriber_id.php",
        form,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      const chatIds = response.data.data.map((item) => item.subscriber_id);
      console.log("Sub ID List ==> ", chatIds);
      CHAT_IDS = chatIds;

      return chatIds;
    } catch (error) {
      console.error("Error in Fetch Sub Ids ======>>>>> ", error);
      return { status: false, data: null };
    }
  };

  async function sendMessage(chatId, message) {
    console.log("Chat Id ==>", chatId);
    try {
      await bot.telegram.sendMessage(chatId, message);
      console.log(`Message sent to chat ID ${chatId}`);
    } catch (error) {
      console.error(`Failed to send message to chat ID ${chatId}:`, error);
    }
  }

  // fetchData(1)

  // insertData({
  //     chat_id: '',
  //     language: '',
  //     subscriber_id: ''
  // })
  //#endregion

  const ListenerFunction = async () => {
    try {
      const provider = new ethers.providers.JsonRpcProvider(
        CONTRACT.rpcProvider
      );
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
          console.log(
            `newUserId Id => ${ethers.BigNumber.from(
              newUserId
            ).toNumber()} | orignalRefId ID => ${ethers.BigNumber.from(
              orignalRefId
            ).toNumber()} | currentRefId => ${ethers.BigNumber.from(
              currentRefId
            ).toNumber()} 
            `
          );
        }
      );
      oxInstance.on(
        "DirectPaid",
        async (to, from, amount, level, timeNow) => {}
      );
      oxInstance.on(
        "TreePayout",
        async (receiverId, senderId, matrix, level, amount, time) => {
          // console.log(
          //   "TreePayout Res ==> ",
          //   ethers.BigNumber.from(receiverId).toNumber()
          // );
          // console.log(
          //   "TreePayout send ==> ",
          //   ethers.BigNumber.from(senderId).toNumber()
          // );
          // console.log(
          //   "TreePayout level ==> ",
          //   ethers.BigNumber.from(level).toNumber()
          // );
          // console.log("TreePayout amount ==> ", toEth(amount));
          for (let i = 0; i < CHAT_IDS.length; i++) {
            console.log(
              `Chat Id => ${
                CHAT_IDS[i]
              } | Receiver Id => ${ethers.BigNumber.from(
                receiverId
              ).toNumber()} | Sender ID => ${ethers.BigNumber.from(
                senderId
              ).toNumber()} | Level => ${ethers.BigNumber.from(
                level
              ).toNumber()} | Amount => ${toEth(amount)}
              `
            );
            sendMessage(
              CHAT_IDS[i],
              `Receiver Id => ${ethers.BigNumber.from(
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
        ) => {}
      );
      oxInstance.on(
        "FreezeAmount",
        async (freezeUserId, senderId, level, amount, time) => {}
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
        ) => {}
      );
      oxInstance.on(
        "FundsPassedUp",
        async (receiverWhoMissedId, sender, level, amountMissed, time) => {}
      );
      oxInstance.on(
        "Upgrade",
        async (msgSenderId, orignalRefId, currentRefId, level, time) => {}
      );
    } catch (error) {
      console.log("Error in listner Func ==> ", error);
    }
  };
  await ListenerFunction().then(() => {
    console.log("contract event listening....");
  });

  function toEth(amount, decimal = 18) {
    const toEth = ethers.utils.formatUnits(amount, decimal);
    return toEth.toString();
  }

  //#region  COMMON BUTTONS,FUNCTIONS

  //#endregion

  //#region  START AND LANGUAGE

  bot.start(async (ctx) => {
    console.log(
      "hi , Now Bot start with ur chat Id ==> ",
      ctx.update.message.chat.id
    );

    if (ctx.update.message.chat.id) {
      const chat_id = ctx.update.message.chat.id;
      const fetch_data = await fetchData(1);
      // if () {
      //   console.log("Fetch Data ==> ", fetch_data.data);
      // } else {
      await ctx.reply(
        "select the language of the bot interface",
        Markup.inlineKeyboard([
          [
            Markup.button.callback("EU", "language_selected_eng"),
            Markup.button.callback("HD", "language_selected_hindi"),
          ],
        ])
      );
      // }
    }
  });

  bot.action("language_selected_eng", async (ctx) => {
    console.log(
      "Language Selected enf ==> ",
      ctx.update.callback_query.message.chat.id
    );
    await insertData({
      chat_id: "",
      language: "",
    });

    LANGUAGE_MODE_FLAG = LANGUAGE_MODE_CONST.english;
    await ctx.reply("✅changes were successfully accepted");
    await ctx.reply(
      "Welcome!! \ntelegram bot sends you instant free notifications \nabout making profits, registering new partners and other important events in your account and the entire echosystem. \n\nTo start using all the feature of the Telegram bot, subscribe to the official Telegram channel at the link below.",
      subscribe_or_not
    );
  });

  bot.action("language_selected_hindi", async (ctx) => {
    LANGUAGE_MODE_FLAG = LANGUAGE_MODE_CONST.hindi;
    await ctx.reply("✅सफलतापूर्वक परिवर्तन स्वीकार लिए गए");
    await ctx.reply(
      "स्वागतम्!! \nटेलीग्राम बॉट आपको तुरंत मुफ्त सूचनाएँ भेजता है। यह सूचनाएँ आपको लाभ कमाने, नए साझेदारों को पंजीकृत करने और आपके खाते और पूरे इकोसिस्टम में अन्य महत्वपूर्ण घटनाओं के बारे में बताती हैं। \n\nटेलीग्राम बॉट की सभी सुविधाओं का उपयोग करने के लिए, नीचे दिए गए लिंक पर जाकर आधिकारिक टेलीग्राम चैनल को सब्सक्राइब करें।",
      subscribe_or_not
    );
  });

  const subscribe_or_not_button = () => {
    if (LANGUAGE_MODE_FLAG === LANGUAGE_MODE_CONST.hindi) {
      return [
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
      ];
    } else {
      return [
        [Markup.button.callback("subscribe @OurChannel", "add_subscription")],
        [Markup.button.callback("i already subscribed", "add_subscription")],
      ];
    }
  };
  const subscribe_or_not = Markup.inlineKeyboard([
    ...subscribe_or_not_button(),
  ]);

  bot.action("add_subscription", async (ctx) => {
    ID_ADD_FLAG = true;
    if (LANGUAGE_MODE_FLAG === LANGUAGE_MODE_CONST.hindi) {
      await ctx.reply("अपना वॉलेट/आईडी दर्ज करें।");
    } else {
      await ctx.reply("Enter your wallet/id");
    }
  });

  //#endregion

  //#region  ID ADD

  const IDS_Loop = () => {
    let tempArray = [];
    for (let index = 0; index < IDS.length; index++) {
      let _tempString = IDS[index];
      tempArray.push([Markup.button.callback(`${_tempString}`, "id_selected")]);
    }
    return tempArray;
  };

  const get_subscribers_id_menu = async (chat_id) => {
    const data = await fetchData(chat_id);
    console.log("Get Subscribe ==> ", data);
    if (data.status === true) {
      const map_of_data = data.data;
      let ID_LOOP = map_of_data.map((element) => {
        return [
          Markup.button.callback(`${element.subscriber_id}`, "id_selected"),
        ];
      });
      return ID_LOOP;
    }
  };

  bot.action("add_subscription", async (ctx) => {
    ID_ADD_FLAG = true;
    await ctx.reply("Enter your wallet/id");
  });

  //#endregion

  //

  //#region  ID DELETE

  const IDS_Loop_Delete = () => {
    let tempArray = [];
    for (let index = 0; index < IDS.length; index++) {
      let _tempString = IDS[index];
      tempArray.push([Markup.button.callback(`${_tempString}`, "id_delete")]);
    }
    return tempArray;
  };

  bot.action("delete_subscription", async (ctx) => {
    if (LANGUAGE_MODE_FLAG === LANGUAGE_MODE_CONST.hindi) {
      await ctx.reply(
        "select which ID you want to delete",
        Markup.inlineKeyboard([...IDS_Loop_Delete()])
      );
    } else {
      await ctx.reply(
        "आप किस आईडी को हटाना चाहते हैं?",
        Markup.inlineKeyboard([...IDS_Loop_Delete()])
      );
    }
    ID_DELETE_FLAG = true;
  });

  bot.action("id_delete", async (ctx) => {
    console.log("Id Delete ==> ", ctx);
    if (LANGUAGE_MODE_FLAG === LANGUAGE_MODE_CONST.hindi) {
      await ctx.reply("आईडी हटा दी गई है।");
    } else {
      await ctx.reply("id deleted");
    }
  });

  //#endregion

  //#region  ACCOUNTS AND SETTING MENUES

  bot.command("Act", async (ctx) => {
    const chat_id = ctx.update.message.chat.id;
    console.log("Account Chat Id =>", chat_id);
    IDS = await fetchSubIds(chat_id);
    SUB_IDS = IDS.data;
    console.log("Account Chat Id =>", SUB_IDS);
    let messageContent = "Subscription IDs:\n";
    IDS.map((id, index) => {
      messageContent += `${index + 1}. ${id}\n`;
    });

    // Send the message back to the user
    ctx.reply(messageContent.trim());
  });

  bot.hears("Accounts", async (ctx) => {
    const chat_id = ctx.update.message.chat.id;
    console.log("Account Chat Id =>", chat_id);
    IDS = await fetchSubIds(chat_id);
    SUB_IDS = IDS;
    console.log("Account Chat Id =>", SUB_IDS);
    let messageContent = "Subscription IDs:\n";
    IDS.map((id, index) => {
      messageContent += `${index + 1}. ${id}\n`;
    });

    // Send the message back to the user
    ctx.reply(messageContent.trim());

    const ID_LOOP = await get_subscribers_id_menu(chat_id);

    let reply = "";
    let Add = "";
    let Delete = "";
    if (LANGUAGE_MODE_FLAG === LANGUAGE_MODE_CONST.hindi) {
      reply =
        "आप उस आईडी पर क्लिक करें जिसे आप इवेंट फिल्टर कॉन्फ़िगर करना चाहते हैं।";
      Add = "जोड़ें";
      Delete = "हटाएं";
    } else {
      reply =
        "Click on the ID you are interested in to configure the event filter:";
      Add = "Add";
      Delete = "Delete";
    }
    await ctx.reply(
      reply,
      Markup.inlineKeyboard([
        [
          Markup.button.callback(Add, "add_subscription"),
          Markup.button.callback(Delete, "delete_subscription"),
        ],
        ...ID_LOOP,
      ]),
      defaultMenu
    );
  });

  bot.action("id_selected", (ctx) =>
    ctx.reply("seetings for ID", Markup.inlineKeyboard([...setting_for_id()]))
  );

  const setting_for_id = () => {
    if (LANGUAGE_MODE_FLAG === LANGUAGE_MODE_CONST.hindi) {
      return [
        [
          Markup.button.callback(
            "घटना प्रकार को अनुलग्न करें",
            "exclude_event_type"
          ),
        ],
        [Markup.button.callback("पीछे जाएं", "exclude_event_type_go_back")],
      ];
    } else {
      return [
        [Markup.button.callback("Exclude event type", "exclude_event_type")],
        [Markup.button.callback("Go back", "exclude_event_type_go_back")],
      ];
    }
  };

  bot.action("exclude_event_type", async (ctx) => {
    if (LANGUAGE_MODE_FLAG === LANGUAGE_MODE_CONST.hindi) {
      await ctx.reply(
        "अपनी घटना को व्यक्तिगत बनाने के लिए सही चुनें: \n✅ - सक्रिय \n❌ - निष्क्रिय",
        account_menu_setting
      );
    } else {
      await ctx.reply(
        "Personlize your event by selecting only right ones \n✅ - activated \n❌ - not activated",
        account_menu_setting
      );
    }
  });

  async function CallAccounts(ctx) {
    const chat_id = ctx.update.message.chat.id;
    const ID_LOOP = await get_subscribers_id_menu(chat_id);

    let reply = "";
    let Add = "";
    let Delete = "";
    if (LANGUAGE_MODE_FLAG === LANGUAGE_MODE_CONST.hindi) {
      reply =
        "आप उस आईडी पर क्लिक करें जिसे आप इवेंट फिल्टर कॉन्फ़िगर करना चाहते हैं।";
      Add = "जोड़ें";
      Delete = "हटाएं";
    } else {
      reply =
        "Click on the ID you are interested in to configure the event filter:";
      Add = "Add";
      Delete = "Delete";
    }
    await ctx.reply(
      reply,
      Markup.inlineKeyboard([
        [
          Markup.button.callback(Add, "add_subscription"),
          Markup.button.callback(Delete, "delete_subscription"),
        ],
        ...ID_LOOP,
      ]),
      defaultMenu
    );
  }

  bot.action("exclude_event_type_go_back", (ctx) => {
    CallAccounts(ctx);
  });

  const account_menu_setting = Markup.inlineKeyboard([
    [Markup.button.callback("plan activation✅", "HD")],
    [Markup.button.callback("Upgrade✅", "HD")],
    [Markup.button.callback("new partner✅", "HD")],
    [Markup.button.callback("new wallet address✅", "HD")],
    [Markup.button.callback("Go Back", "exclude_event_type_go_back")],
  ]);

  bot.hears("Settings", (ctx) =>
    ctx.reply("You selected Settings", defaultMenu)
  );

  //#endregion

  bot.action("HD", (ctx) => ctx.reply("button pressed"));

  const sendToMsgAllThatSubId = async (subId , chatId) => {
    const chatIds = await fetchData(subId);
    console.log("Chat Id in SUb Id =>",chatIds, subId);
    for (let id = 0; id < chatIds.length; id++) {
        const msg = `${chatId} Joind Sub_i
        d => ${subId}` 
        sendMessage(chatIds[id] , msg)
    }
  }

  bot.on("text", async (ctx) => {
    // ID_ADD_FLAG = true;
    // console.log("Flag ==> " , ID_ADD_FLAG);
    const myChatId = ctx.update.message.chat.id;
    if (ID_ADD_FLAG) {
      const texts = ctx.message.text;
      SUB_IDS.push(texts);
      console.log("Text in msg ===> ", texts);

      await sendToMsgAllThatSubId(texts , myChatId);
      //do some id or wallet check/validation here
      //add to main associate ids

      IDS.push(texts);
      if (LANGUAGE_MODE_FLAG === LANGUAGE_MODE_CONST.hindi) {
        await ctx.reply(
          `वॉलेट पता जोड़ दिया गया। धन्यवाद! '${texts}'`,
          defaultMenu
        );
      } else {
        await ctx.reply(`wallet address added '${texts}'`, defaultMenu);
      }
      ID_ADD_FLAG = false;
      // console.log(ctx);
      // console.log("-->>", ctx.update.message);
      const chat_id = ctx.update.message.chat.id;

      const insert = await insertData({
        chat_id: chat_id,
        language: LANGUAGE_MODE_CONST.english,
        subscriber_id: texts,
      });
      console.log("Insert Data ==> ", insert);
    } else if (ID_DELETE_FLAG) {
      // DELETE FUNCTION
    } else {
      const messageFromUser = ctx.message.text;
      await ctx.reply(`You said: ${messageFromUser}`);
    }
  });

  //#region  LAUNCH

  bot.launch(() => {
    console.log("bot is live!!!!!");
  });

  process.once("SIGINT", () => bot.stop("SIGINT"));
  process.once("SIGTERM", () => bot.stop("SIGTERM"));

  //#endregion
} catch (error) {
  console.log("Error While Start BOT ==>> ", error);
}

// to check that member has sbscribed to channel or not
// try {
//     const chatMember = await ctx.telegram.getChatMember(CHANNEL_ID, userId);

//     if (chatMember.status === 'member' || chatMember.status === 'administrator' || chatMember.status === 'creator') {
//         ctx.reply('You are a member of the channel!');
//     } else {
//         ctx.reply('You are not a member of the channel.');
//     }
// } catch (error) {
//     console.error('Error checking membership:', error);
//     ctx.reply('There was an error checking your membership status.');
// }
