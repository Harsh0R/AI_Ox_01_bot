//#region APIS

import axios from "axios";
import FormData from "form-data";




export const checkChatid = async (data) => {
  try {
    console.log("insert data ===>>", data);
    if (data) {
      const form = new FormData();
      form.append("chat_id", data);

      const response = await axios.post(
        "https://thecrypto360.com/notifier_bot/check_Chatid.php",
        form,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      // Check if the response status code indicates a conflict
     
      if (response.status === 200) {
        console.log("Data already exists" , response.status);
        return response.status
      }else if (response.status === 404) {
        return response.status
      }

      console.log("Add respo ==> ", response.data);
      return { status: true, data: response.data };
    } else {
      return { status: false, data: null };
    }
  } catch (error) {
    console.error("Error in set data =====>?>>>>>", error);
    return { status: false, data: null };
  }
};



export const insertData = async (data) => {
  try {
    console.log("insert data ===>>", data);
    if (data.chat_id && data.language && data.subscriber_id) {
      const form = new FormData();
      form.append("chat_id", data.chat_id);
      form.append("language", data.language);
      form.append("subscriber_id", data.subscriber_id);

      const response = await axios.post(
        "https://thecrypto360.com/notifier_bot/storedata.php",
        form,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      // Check if the response status code indicates a conflict
     
      if (response.status === 200) {
        
        console.log("Data already exists" , response.data.data);
        return { status: false, message: response.data.data };
      }

      console.log("Add respo ==> ", response.data);
      return { status: true, data: response.data };
    } else {
      return { status: false, data: null };
    }
  } catch (error) {
    console.error("Error in set data =====>?>>>>>", error);
    return { status: false, data: null };
  }
};

export const getChatIdFromSubID = async (data) => {
  try {
    // console.log("Get Chat Id Para -=--=>", data);
    const form = new FormData();
    form.append("subscriber_id", data);
    // console.log("Form in Get Chat Id ==:> ", form);
    const response = await axios.post(
      "https://thecrypto360.com/notifier_bot/getchat_id.php",
      form,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );

    const chatIds = response.data.data.map((item) => item.chat_id);
    // console.log("Chat Id List ==> ", chatIds);
    // CHAT_IDS = chatIds;

    // return response.data;
    return chatIds;
  } catch (error) {
    console.error("Error in Get Chain ids  ======>>>>> ", error);
    return { status: false, data: null };
  }
};

export const getSubIdFromChatId = async (data) => {
  try {
    // console.log("get subId Para -=--=>", data);
    const form = new FormData();
    form.append("chat_id", data);
    // console.log("Form in Get Sub Id ==:> ", form);
    const response = await axios.post(
      "https://thecrypto360.com/notifier_bot/getsubscriber_id.php",
      form,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );

    const chatIds = response.data.data.map((item) => item.subscriber_id);
    // console.log("Sub ID List ==> ", chatIds);

    // console.log("ressss===>>>> ", response.data);
    // return response.data;
    return { status: response.data.status, data: chatIds };
  } catch (error) {
    console.error("Error in Get Sub Ids ======>>>>> ", error);
    return { status: false, data: null };
  }
};

export const deleteChatId = async (chatID, SubID) => {
  try {
    // console.log("get subId Para -=--=>", data);
    const form = new FormData();
    form.append("chat_id", chatID);
    form.append("subscriber_id", SubID);
    // console.log("Form in Get Sub Id ==:> ", form);
    const response = await axios.post(
      "https://thecrypto360.com/notifier_bot/deletechat.php",
      form,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );

    const chatIds = response.data.data.map((item) => item.subscriber_id);
    // console.log("Sub ID List ==> ", chatIds);

    // return response.data;
    return chatIds;
  } catch (error) {
    console.error("Error in Get Sub Ids ======>>>>> ", error);
    return { status: false, data: null };
  }
};
