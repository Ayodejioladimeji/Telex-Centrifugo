import React, { useContext, useState } from 'react';
import styles from '../styles/UserCard.module.css';
import { DataContext } from '@/store/GlobalState';
import { ACTIONS } from '@/store/Actions';
import NameModal from '@/common/name-modal';


const UserCard = ({ item, onRemove }) => {
  const { state, dispatch } = useContext(DataContext);
  const [name, setName] = useState(null);

  const handleCardClick = () => {
    setName(item);
    dispatch({type:ACTIONS.ROUTE, payload:item})
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
      <span className={styles.cancel} onClick={() => onRemove(item)}>X</span>


      {state?.nameModal && <NameModal />}
    </div>
  );
};

export default UserCard;
