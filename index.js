import { Telegraf, Markup } from "telegraf";
import CONTRACT from "./constant.js";
import { insertData } from "./apiFunc.js";
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
  idFlag: false,
};

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
    oxInstance.on("DirectPaid", async (to, from, amount, level, timeNow) => {});
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
            `Chat Id => ${CHAT_IDS[i]} | Receiver Id => ${ethers.BigNumber.from(
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

bot.start(async (ctx) => {
  try {
    console.log("Bot Start ...");
    await ctx.reply(
      "Select the language of the bot interface",
      Markup.inlineKeyboard([
        [
          Markup.button.callback("EU", "language_selected_eng"),
          Markup.button.callback("HD", "language_selected_hindi"),
        ],
      ])
    );
  } catch (error) {
    console.error("Error while starting BOT:", error);
  }
});

// Language selection handlers
const handleLanguageSelection = async (ctx, language) => {
  userState.chatId = ctx.update.callback_query.message.chat.id;
  userState.language = language;
  userState.idFlag = true;

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
  userState.idFlag = true;
  const prompt =
    userState.language === LANGUAGE_MODE_CONST.hindi
      ? "अपना वॉलेट/आईडी दर्ज करें।"
      : "Enter your wallet/id";
  await ctx.reply(prompt);
});

// Handle text messages to capture and store the ID
bot.on("text", async (ctx) => {
  if (userState.idFlag) {
    const userId = ctx.message.text;

    if (userState.chatId && userState.language && userId) {
      const result = await insertData({
        chat_id: userState.chatId,
        language: userState.language,
        subscriber_id: userId,
      });

      const responseMessage = result.status
        ? userState.language === LANGUAGE_MODE_CONST.hindi
          ? "✔ आपका आईडी सफलतापूर्वक दर्ज किया गया है।"
          : "✔ Your ID has been successfully recorded."
        : userState.language === LANGUAGE_MODE_CONST.hindi
        ? "❌ कुछ गलत हो गया। कृपया पुनः प्रयास करें।"
        : "❌ Something went wrong. Please try again.";

      await ctx.reply(responseMessage);
    } else {
      await ctx.reply(
        userState.language === LANGUAGE_MODE_CONST.hindi
          ? "पहले भाषा को चुनें।"
          : "Please select the language first."
      );
    }

    // Reset the flag after processing
    userState.idFlag = false;
  }
});

// Launch the bot and setup contract event listeners
(async () => {
  await bot.launch();
  await ListenerFunction().then(() => {
    console.log("contract event listening....");
  });
  console.log("Bot is live and contract events are being listened to...");
})

();
