import React, { useContext, useState, useEffect } from 'react';
import styles from '../styles/UserCard.module.css';
import { DataContext } from '@/store/GlobalState';
import { ACTIONS } from '@/store/Actions';
import NameModal from '@/common/name-modal';
import axios from 'axios';
import cogoToast from "cogo-toast";
import { useRouter } from "next/router";


const UserCard = ({ item, id, admin_id, onDelete }) => {
  const { state, dispatch } = useContext(DataContext);
  const [status, setStatus] = useState(null);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const router = useRouter()
  const [user, setUser] = useState(null);
  const [room, setRoom] = useState(null);

  useEffect(() => {
    const user = localStorage.getItem("user");
    setUser(JSON.parse(user))
    const room = localStorage.getItem('rooms')
    setRoom(JSON.parse(room))
  }, [])

  const checkUser = async () => {
    try {
      const accessToken = localStorage.getItem('access_token');
      const response = await axios.get(`${apiUrl}/rooms/${id}/user-exist`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })
      setStatus(response.data.data.exist)
    } catch (error) {
      cogoToast.error(error.message)
    }
  }

  const handleRemove = async (roomId: string) => {
    const roomToRemove = room.find(item => item.room_id === roomId);
    if (!roomToRemove) {
      return cogoToast.error("Room not found.");
    }

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
      cogoToast.success("Successfully left the room.");
      router.push(`/message`)
    }
  };


  const handleJoin = async (id: string, item: string) => {
    const accessToken = localStorage.getItem('access_token');
    const response = await axios.post(`${apiUrl}/rooms/${id}/join`, { "username": user?.username }, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })

    if (response?.status !== 200) {
      cogoToast.error("An error occurred while joining the room.");
      return
    }
    else {
      cogoToast.success("Successfully joined the room.");
      checkUser();
      router.push(`/message/${id}`)
      dispatch({ type: ACTIONS.ROUTE, payload: item })
      dispatch({ type: ACTIONS.ID, payload: id })
      dispatch({ type: ACTIONS.NAME_MODAL, payload: true });
    }
  }

  useEffect(() => {
    const checkUser = async () => {
      try {
        const accessToken = localStorage.getItem('access_token');
        const response = await axios.get(`${apiUrl}/rooms/${id}/user-exist`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        })
        setStatus(response.data.data.exist)
      } catch (error) {
        cogoToast.error(error.message)
      }
    }
    checkUser();
  }, [])

  const handleLeaveDelete = (id) => {
    if (admin_id === user?.id) {
      onDelete(id)
    } else {
      handleRemove(id);
    }
  }

  return (
    <div className={styles.card_box}>
      <div className={styles.user_card}>
        <div>
          <div className={styles.user_link}>
            <div className={styles.user_card_div}>
              <span className="text-capitalize">{item}</span>
            </div>
          </div>
        </div>
      </div>
      {status ? (<span className={styles.cancel} onClick={() => handleLeaveDelete(id)}>{admin_id === user?.id ? 'Delete' : 'Leave'}</span>) : (<span className={styles.success} onClick={() => handleJoin(id, item)}>Join</span>)}
      {state?.nameModal && <NameModal />}
    </div>
  );
};

export default UserCard;
