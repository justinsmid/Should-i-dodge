import Homepage from "./Homepage";
import SettingsPage from "./SettingsPage";

export default [
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