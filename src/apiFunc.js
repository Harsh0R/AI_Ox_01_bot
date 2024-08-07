//#region APIS
import axios from "axios";
import FormData from "form-data";
import logError from "./logger.js";

export const checkChatid = async (data) => {
  try {
    if (data) {
      const form = new FormData();
      form.append("chat_id", data);

      const response = await axios.post(
        "https://thecrypto360.com/notifier_bot/check_Chatid.php",
        form,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (response.status === 200) {
        return response.status;
      } else if (response.status === 404) {
        return response.data.status;
      }
      return { status: true, data: response.data };
    } else {
      return { status: false, data: null };
    }
  } catch (error) {
    logError("Error Check data API =====>?>>>>>",error)
    return { status: false, data: null };
  }
};

export const editData = async (data) => {
  try {
    if (data.chat_id && data.subscriber_id && data.events) {
      const form = new FormData();
      form.append("chat_id", data.chat_id);
      form.append("subscriber_id", data.subscriber_id);
      form.append("events", JSON.stringify(data.events));

      const response = await axios.post(
        "https://thecrypto360.com/notifier_bot/editdata.php",
        form,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (response.status === 201) {
        return { status: true, data: response.data.data };
      }
    } else {
      return { status: false, data: null };
    }
  } catch (error) {
    logError("Error in Edite data API =====>?>>>>>",error)
    return { status: false, data: null };
  }
};

export const insertData = async (data) => {
  try {
    if (data.chat_id && data.language && data.subscriber_id && data.events) {
      const form = new FormData();
      form.append("chat_id", data.chat_id);
      form.append("language", data.language);
      form.append("subscriber_id", data.subscriber_id);
      form.append("events", JSON.stringify(data.events));

      const response = await axios.post(
        "https://thecrypto360.com/notifier_bot/storedata.php",
        form,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (response.status === 200) {
        return { status: false, message: response.data.data };
      }

      return { status: true, data: response.data };
    } else {
      return { status: false, data: null };
    }
  } catch (error) {
    logError("Error in Insert data API =====>?>>>>>",error)
    return { status: false, data: null };
  }
};

export const getChatIdFromSubID = async (data) => {
  try {
    const form = new FormData();
    form.append("subscriber_id", data);
    const response = await axios.post(
      "https://thecrypto360.com/notifier_bot/getchat_id.php",
      form,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );

    const chatIds = response.data.data.map((item) => item.chat_id);
    
    return chatIds;
  } catch (error) {
    logError("Error in Get ChatID from SubId  API =====>?>>>>>",error)
    return { status: false, data: null };
  }
};

export const getDataFromChatId = async (data) => {
  try {
    const form = new FormData();
    form.append("chat_id", data);
    const response = await axios.post(
      "https://thecrypto360.com/notifier_bot/getsubscriber_id.php",
      form,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );

    return {
      status: response.data.status,
      data: response.data.subscribers,
      language: response.data.language,
      events: response.data.events,
    };
  } catch (error) {
    logError("Error in Get data from ChatID API =====>?>>>>>",error)
    return { status: false, data: null };
  }
};

export const deleteChatId = async (chatID, SubID) => {
  try {
    const form = new FormData();
    form.append("chat_id", chatID);
    form.append("subscriber_id", SubID);
    const response = await axios.post(
      "https://thecrypto360.com/notifier_bot/deletechat.php",
      form,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return response;
  } catch (error) {
    logError("Error in Delete data API =====>?>>>>>",error)
    return { status: false, data: "Not Found" };
  }
};
