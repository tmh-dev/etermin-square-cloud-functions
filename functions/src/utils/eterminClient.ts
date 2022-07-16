import * as functions from "firebase-functions";
import got from "got";

export const eterminClient = got.extend({
  prefixUrl: "https://www.etermin.net/api/",
  headers: {
    publickey: process.env.ETERMIN_PUBLIC_KEY,
    salt: process.env.ETERMIN_SALT,
    signature: process.env.ETERMIN_SIGNATURE,
  },
  retry: 3,
  timeout: 10000,
});

export const confirmAppointment = async (appointmentUid: string) => {
  try {
    const response = await eterminClient.put("appointment", {
      searchParams: {
        id: appointmentUid,
        manualconfirmed: 1,
      },
    });

    functions.logger.info(response.statusCode, response.statusMessage);
  } catch (err) {
    functions.logger.error(err);
  }
};

export const deleteAppointment = async (appointmentUid: string) => {
  try {
    const response = await eterminClient.delete("appointment", {
      searchParams: {
        id: appointmentUid,
      },
    });

    functions.logger.info(response.statusCode, response.statusMessage);
  } catch (err) {
    functions.logger.error(err);
  }
};
