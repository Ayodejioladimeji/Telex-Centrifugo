import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import styles from '../styles/LeftSide.module.css';
import { useRouter } from 'next/router';
import UserCard from './UserCard';
import { ACTIONS } from '@/store/Actions';
import { DataContext } from '@/store/GlobalState';
import cogoToast from 'cogo-toast';
import { FaAlignJustify } from 'react-icons/fa';

interface User {
  user_id: string;
  username: string;
}


interface Room {
  room_id: string;
  user_id: string;
  name: string;
  description: string;
  users: User[] | null;
  created_at: string;
  deleted_at: string;
}

const ChatList = ({ showNav, setShowNav }) => {
  const router = useRouter();
  const [create, setCreate] = useState(false);
  const [room, setRoom] = useState<Room[]>([]);
  const [name, setName] = useState("");
  const { dispatch } = useContext(DataContext);
  const [loading, setLoading] = useState(true);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  // Load existing rooms from database on component mount
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const accessToken = localStorage.getItem('access_token');
        const response = await axios.get(`${apiUrl}/rooms`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });

        setRoom(response.data.data);
      } catch (error) {
        cogoToast.error(error.message)
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  // Create room
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (name.trim() !== "") {
      // check if room contains space
      if (name.trim().includes(" ")) {
        return cogoToast.error("Room name cannot include space");
      }

      const lowerCaseName = name.trim().toLowerCase();
      const roomNames = room.map(r => r.name.toLowerCase());
      if (roomNames.includes(lowerCaseName)) {
        return cogoToast.error("Room already exists");
      }

      setLoading(true);
      const accessToken = localStorage.getItem('access_token');
      const user = localStorage.getItem('user');
      const userData = user ? JSON.parse(user) : {};
      const response = await axios.post(`${apiUrl}/rooms`, {
        name: name.trim(),
        username: userData.username || '',
        description: name.trim()
      }, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        }
      });

      if (response?.status !== 201) {
        cogoToast.error("Channel not created successfully")
        return
      } else {
        const updatedList = [...room, response.data];
        setRoom(updatedList);
        cogoToast.success("channel created successfully");
        setName("");
      }
      setLoading(false);
    }
  };

  // Remove room
  const handleRemove = async (roomId: string) => {
    // Check if the room ID exists in the list
    const roomToRemove = room.find(item => item.room_id === roomId);
    if (!roomToRemove) {
      return cogoToast.error("Room not found.");
    }

    setLoading(true);
    const accessToken = localStorage.getItem('access_token');
    const response = await axios.post(
      `${apiUrl}/rooms/${roomId}/leave`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );
    console.log(response);
    if (response?.status !== 200) {
      cogoToast.error("An error occurred while leaving the room.");
      return
    }
    else {
      console.log(room)
      const updatedList = room.filter(item => item.room_id !== roomId);
      setRoom(updatedList);
      cogoToast.success("Successfully left the room.");
    }
    setLoading(false);
  };

  // Delete Room
  const handleDelete = async (roomId: string) => {
    // Check if the room ID exists in the list
    const roomToRemove = room.find(item => item.room_id === roomId);
    if (!roomToRemove) {
      return cogoToast.error("Room not found.");
    }

    setLoading(true);
    const accessToken = localStorage.getItem('access_token');
    const response = await axios.delete(
      `${apiUrl}/rooms/${roomId}`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );
    console.log(response);
    if (response?.status !== 200) {
      cogoToast.error("An error occurred while leaving the room.");
      return
    }
    else {
      console.log(room)
      const updatedList = room.filter(item => item.room_id !== roomId);
      setRoom(updatedList);
      cogoToast.success("Successfully left the room.");
    }
    setLoading(false);
  }

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
        <UserCard admin_id={item.user_id} id={item.room_id} item={item.name} key={index} onRemove={handleRemove} onDelete={handleDelete} />
      ))}

      {!loading && room?.length === 0 && (
        <p className="text-secondary text-center mt-5">No available rooms</p>
      )}
    </div>
  );
};

export default ChatList;
