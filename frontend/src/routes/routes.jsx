import { createBrowserRouter } from "react-router-dom";
// RootLayout komponentingizni qayerdadir import qilgan bo'lishingiz kerak:
import RootLayout from "./RootLayout";

const routes = createBrowserRouter([
    {
        path: '/',
        element: <RootLayout /> // String emas, React komponent sifatida beriladi
    }
]);

export default routes; // To'g'ri default eksport