"use client"

import { useState , useEffect} from "react"
import { Plus, Search , Loader2  } from "lucide-react"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface Person {
    id : String 
    username : String 
    email : String
}

// const people: Person[] = [
//   { id: "1", name: "Alice Johnson", avatar: "/placeholder.svg?height=32&width=32" },
//   { id: "2", name: "Bob Smith", avatar: "/placeholder.svg?height=32&width=32" },
//   { id: "3", name: "Charlie Brown", avatar: "/placeholder.svg?height=32&width=32" },
//   { id: "4", name: "Diana Prince", avatar: "/placeholder.svg?height=32&width=32" },
//   { id: "5", name: "Ethan Hunt", avatar: "/placeholder.svg?height=32&width=32" },
// ]

export function PeopleSheet() {
  const [searchQuery, setSearchQuery] = useState("");
  const [people , setPeople] = useState<Person[]>([]);
  const [isLoading , setIsLoading] = useState(false);

  useEffect(()=>{
    setIsLoading(true)
    const userId = localStorage.userId; 
    axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/user/getusers/${userId}` , {
        withCredentials : true
    })
    .then((res)=>{
        setPeople(res.data.data);
        setIsLoading(false);
    })
    .catch((error)=>{
        setIsLoading(false);
        console.log("Error fetching users");
        
    })
    .finally(()=>{
        setIsLoading(false);
    })

  }, [])

  const handleAddChatFriend = async(id : String) => {

  }

  console.log("This is my people data " , people);

  const filteredPeople = people.filter((person) => person.username.toLowerCase().includes(searchQuery.toLowerCase()));
  console.log("filtered " , filteredPeople);

  return (
    <Sheet>
      <SheetTrigger asChild>
      <Search className="text-gray-300 h-6 w-6 hover:text-gray-500 hover:cursor-pointer" />
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>People</SheetTitle>
          <SheetDescription>Search and add people to your network.</SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-4">
          <Input
            type="search"
            placeholder="Search people..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
           <div className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center items-center h-32">
                <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
              </div>
            ) : (
              filteredPeople.map((person , index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      {/* <AvatarImage src={person.avatar} alt={person.name} /> */}
                      <AvatarFallback>{person.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{person.username}</span>
                  </div>
                  <Button size="icon" variant="ghost"
                  onClick={() => handleAddChatFriend(person.id)}>
                    <Plus className="h-4 w-4" />
                    <span className="sr-only">Add {person.username}</span>
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

