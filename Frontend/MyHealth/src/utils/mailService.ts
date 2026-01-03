import emailjs from '@emailjs/browser';


export async function sendMail  (mailData:any){

    if(!import.meta.env.VITE_EMAILJS_SERVICE_ID || !import.meta.env.VITE_EMAILJS_TEMPLATE_ID || !import.meta.env.VITE_EMAILJS_USER_ID){
      throw new Error("EmailJS environment variables are not set");
    };


    await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        mailData,
        import.meta.env.VITE_EMAILJS_USER_ID
      );

}