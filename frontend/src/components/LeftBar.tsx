'use client'
import { Filter, Search } from "lucide-react";
import FilterTabs from "./FilterTabs";
import { useState , useEffect , useMemo} from "react";
import { Dispatch , SetStateAction } from "react";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { PeopleSheet } from "./SearchSheet";
import { HiUserGroup } from "react-icons/hi2";
import { CreateGroupDialog } from "./CreateGroupDialog";

import { io } from "socket.io-client";


interface ChatsType {
  id : string 
  name : String | undefined 
  isGroup : Boolean
  latestMessage : String | undefined
  createdAt : Date
  users : UserDetailsType[]
}

interface UserDetailsType {
  userId : String , 
  username : String
}

type LeftBarProps = {
  selectedChat : string  , 
  setSelectedChat : React.Dispatch<React.SetStateAction<string>>;
}

export default function LeftBar({selectedChat , setSelectedChat } : LeftBarProps) {

  const socket = useMemo(
    () =>
      io(`${process.env.NEXT_PUBLIC_BACKEND_URL}`, {  
        withCredentials: true,
      }),
    []
  );
  console.log("localstorage id " , localStorage.userId);
  const[chats , setChats] = useState<ChatsType[]>([]);
  const[chat , setChat] = useState() ; 
  const[fetchAgain , setFetchAgain]= useState(false);
  const[newChat , setNewChat] = useState<ChatsType>(); 

  useEffect(()=>{
    
    const loggedInUser = localStorage.userId; 
    socket.emit("get-chats" , loggedInUser);
    console.log(loggedInUser);

    socket.on("get-all-chats" , (chats : ChatsType[] ) => {
      setChats(chats);
    })

    socket.on("new-chat-added" , (newChat) => {
      setChat(newChat);
      console.log("SearchSheet component me chat aagya" , newChat)
    } )

    return ()=> {
      socket.off("new-chat-added"); 
    }


    // axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/chat/getChats/${loggedInUser}`)
    // .then((res) => {
    //     setChats(res.data.data);
    // })
    // .catch((error)=>{
    //   console.log("Something went wrong" , error );
    // })
  } , [socket , fetchAgain])


  useEffect(()=>{
    if(newChat){
      const newChatWithOtherUserName = {...newChat , name : getOtherUserName(newChat)}
      setChats((prevState)=> [...prevState , newChatWithOtherUserName]);
    }
  },[newChat]);

  //function to pass new chat from child to parent 
  const handleNewChat = (newChat : ChatsType) => {
    setNewChat(newChat);
    console.log("new chat :", newChat);
  }


  //utility function to get the name of the other single chat
  const getOtherUserName = (chat : ChatsType) => {
   if(chat.isGroup || chat.name != null ) return chat.name ; 

   const userId = localStorage.userId ;
  
   const filteredChat = chat.users.filter((user)=>user.userId !== userId);
   console.log("This is the filteredChat" , filteredChat);
   return filteredChat[0]?.username;
  }


  const convertTimeToReadableFormat = (time : Date) =>{
     // Create a Date object from the ISO string
      const date = new Date(time);

      // Extract hours and minutes
      let hours = date.getHours();
      const minutes = date.getMinutes();

      // Determine AM or PM
      const ampm = hours >= 12 ? "PM" : "AM";

      // Convert to 12-hour format
      hours = hours % 12;
      hours = hours || 12; // Handle midnight (0 hours)

      // Format minutes to always be two digits
      const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;

      // Combine into the final readable time string
      return `${hours}:${formattedMinutes} ${ampm}`;
  }

  return (
    <>
      <div className="p-4 border-gray-300 rounded-md border-[1px] w-full bg-white h-screen">
        {/* Profile Section */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="h-12 w-12 flex justify-center items-center rounded-full bg-gray-200">
              <div className="text-center font-semibold">AB</div>
            </div>

            {/* User Info */}
            <div className="flex flex-col justify-center">
              <h2 className="text-md tracking-tight">Aayush</h2>
              <p className="text-xs text-gray-500">Info Account</p>
            </div>
          </div>

          {/* Search Icon */}
          <div className="flex items-center gap-3">
           <PeopleSheet socket = {socket} sendChatToParent = {handleNewChat}></PeopleSheet>
           <CreateGroupDialog setFetchAgain = {setFetchAgain}></CreateGroupDialog> 
          </div>
        </div>

        
            <FilterTabs></FilterTabs>
       

        {/* Chats and Latest Message Section */}
        <div className="mt-4">
            <p className="text-gray-500 font-light mb-3 ">Messages</p>
            {chats.map(( chat , index)=>(
                <div 
                 key={index}
                 className={`flex justify-between items-center mb-6 cursor-pointer ${selectedChat === chat.id  ? "bg-blue-100" : "hover:bg-gray-100"} `}
                 onClick={()=> setSelectedChat(chat.id)}>
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-200">
                    <div className="text-center font-semibold">BC</div>
                  </div>
    
                  {/* Chat Info */}
                  <div className="flex flex-col">
                    <h2 className="text-sm tracking-tight">{getOtherUserName(chat)}</h2>
                    <p className="text-xs text-gray-500">{
                     chat.latestMessage && chat.latestMessage.length > 25 ? 
                    (chat.latestMessage?.slice(0 , 25) + '...') : (chat.latestMessage)}</p>
                  </div>
                </div>
    
                {/* Time */}
                <p className="text-xs text-gray-400">{convertTimeToReadableFormat(chat.createdAt)}</p>
              </div>
            ))}
        </div>
      </div>
    </>
  );
}
