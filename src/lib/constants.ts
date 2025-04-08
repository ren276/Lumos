import NavMain from "@/components/global/app-sidebar/nav-main";
import { url } from "inspector";
import { title } from "process";
import {Home} from "@/icons/Home"
import {Templates} from "@/icons/Templates"
import {Trash} from "@/icons/Trash"
import Settings from "@/icons/Settings"

export const data = {
    user:{
        name:"shadcn",
        email:'m@gamil.com',
        avatar:'/avatars/shadcn.png',
    },

    navMain:[
        {
            title:'Home',
            url:'/dashboard',
            icon: Home,
        },

        {
            title:'Templates',
            url:'/templates',
            icon: Templates,
        },

        {
            title:'Trash',
            url:'/trash',
            icon: Trash,
        },

        {
            title:'Settings',
            url:'/settings',
            icon: Settings,
        },


    ],
}