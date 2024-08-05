import React, { useContext, useEffect, useState } from 'react';
import styles from '../styles/LeftSide.module.css';
import { useRouter } from 'next/router';
import UserCard from './UserCard';
import { ACTIONS } from '@/store/Actions';
import { DataContext } from '@/store/GlobalState';

const ChatList = () => {
  const router = useRouter();
  const [create, setCreate] = useState(false)
  const [room, setRoom] = useState<string[]>([])
  const [name,setName] = useState("")
  const {dispatch} = useContext(DataContext)

  // Load existing rooms from localStorage on component mount
  useEffect(() => {
    const storedNames = localStorage.getItem("room");
    if (storedNames) {
      setRoom(JSON.parse(storedNames));
    }
  }, []);


  // create room
  const handleCreate = (e) => {
    e.preventDefault()

    if (name.trim() !== "") {
      const updatedList = [...room, name.trim()]
      setRoom(updatedList);
      localStorage.setItem("room", JSON.stringify(updatedList));
      setName("");
    }
   
  }

  const handleAddUser = () => {

  }

  return (
    <div className={styles.chat_list}>
     <div className={styles.chat_box}>
        <h3>Telex Centrifugo</h3>

        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder='Create a room'/>
        <button onClick={handleCreate}>Create Room</button>
     </div>

      <h3>Available Rooms</h3>

       {room?.map((item, index) => {
        return(
          <UserCard item={item} key={index}/>
        )
       })}
    </div>
  );
};

export default ChatList;
