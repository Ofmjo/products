let tg = window.Telegram.WebApp;
tg.expand();

//Аватар пользователя в телеграм
const user_img = tg.initDataUnsafe?.user?.photo_url || "../assets/nouser.png";