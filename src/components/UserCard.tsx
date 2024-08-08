import React, { useContext, useState, useEffect } from 'react';
import styles from '../styles/UserCard.module.css';
import { DataContext } from '@/store/GlobalState';
import { ACTIONS } from '@/store/Actions';
import NameModal from '@/common/name-modal';
import axios from 'axios';
import cogoToast from "cogo-toast";
import { useRouter } from "next/router";


const UserCard = ({ item, id, onRemove, onJoin, admin_id, onDelete }) => {
  const { state, dispatch } = useContext(DataContext);
  const [status, setStatus] = useState(null);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const router = useRouter()
  const [user, setUser] = useState(null);

  useEffect(() => {
    const user = localStorage.getItem("user");
    setUser(JSON.parse(user))
  }, [])

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

  const handleCardClick = () => {
    setName(item);
    console.log(name)
    dispatch({ type: ACTIONS.ROUTE, payload: item })
    dispatch({ type: ACTIONS.ID, payload: id })
    dispatch({ type: ACTIONS.NAME_MODAL, payload: true });
  };

  return (
    <div className={styles.card_box}>
      <div className={styles.user_card} onClick={handleCardClick}>
        <div>
          <div className={styles.user_link}>
            <div className={styles.user_card_div}>
              <span className="text-capitalize">{item}</span>
            </div>
          </div>
        </div>
      </div>
      {status ? (<span className={styles.cancel} onClick={() => onRemove(id)}>{admin_id === user?.id ? 'Delete' : 'Leave'}</span>) : (<span className={styles.success} onClick={() => onJoin(id, item)}>Join</span>)}
      {state?.nameModal && <NameModal />}
    </div>
  );
};

export default UserCard;
