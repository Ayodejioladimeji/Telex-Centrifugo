import React, { useContext, useEffect, useState } from 'react';
import styles from '../styles/LeftSide.module.css';
import { useRouter } from 'next/router';
import UserCard from './UserCard';
import { ACTIONS } from '@/store/Actions';
import { DataContext } from '@/store/GlobalState';
import cogoToast from 'cogo-toast';
import { FaAlignJustify } from 'react-icons/fa';

const ChatList = ({showNav, setShowNav}) => {
  const router = useRouter();
  const [create, setCreate] = useState(false);
  const [room, setRoom] = useState<string[]>([]);
  const [name, setName] = useState("");
  const { dispatch } = useContext(DataContext);
  const [loading, setLoading] = useState(true);

  // Load existing rooms from localStorage on component mount
  useEffect(() => {
    const storedNames = localStorage.getItem("room");
    if (storedNames) {
      setRoom(JSON.parse(storedNames));
    }
    setLoading(false);
  }, []);

  // Create room
  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();

    if (name.trim() !== "") {
      // check if room contains space
      if (name.trim().includes(" ")) {
        return cogoToast.error("Room name cannot include space");
      }

      // check if room is already created
      if(room.includes(name.trim().toLowerCase())){
        return cogoToast.error("Room already exists");
      }

      const updatedList = [...room, name.trim().toLowerCase()];
      setRoom(updatedList);
      localStorage.setItem("room", JSON.stringify(updatedList));
      setName("");
    }
  };

  // Remove room
  const handleRemove = (roomName: string) => {
    const updatedList = room.filter((item) => item !== roomName);
    setRoom(updatedList);
    localStorage.setItem("room", JSON.stringify(updatedList));
  };

  return (
    <div className={styles.chat_list}>
      <div className={styles.chat_box}>
        <h3>Telex Centrifugo</h3>
        <FaAlignJustify className={styles.icons} onClick={() => setShowNav(!showNav)} />


        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder='Create a room'
        />
        <button onClick={handleCreate}>Create Room</button>
      </div>

      <h4 className="text-center">Available Rooms</h4>
      <hr />

      {room?.map((item, index) => (
        <UserCard item={item} key={index} onRemove={handleRemove} />
      ))}

      {!loading && room?.length === 0 && (
        <p className="text-secondary text-center mt-5">No available rooms</p>
      )}
    </div>
  );
};

export default ChatList;
