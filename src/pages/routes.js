import Homepage from "./Homepage";
import SettingsPage from "./SettingsPage";

const routes = [
    {
        path: ['/', '/home'],
        linkPath: '/home',
        title: 'Homepage',
        component: Homepage
    },
    {
        path: ['/settings'],
        linkPath: '/settings',
        title: 'Settings',
        component: SettingsPage
    }
];

export default routes;