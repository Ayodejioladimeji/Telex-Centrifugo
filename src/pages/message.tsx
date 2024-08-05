import React from 'react';

// COMPONENTS
import styles from '../styles/index.module.css';
import LeftSide from '@/components/LeftSide';
import NameModal from '@/common/name-modal';

const Conversation = () => {

  return (
    <div className={styles.conversation}>
      <div className={styles.left_conversations}>
        <LeftSide />
      </div>

      <div className={styles.right_conversation}>
        <div className={styles.right_center}>
          <h4>Telex Room Chat</h4>
          <p>
            Select a room to start chatting
          </p>
        </div>
      </div>
    </div>
  );
};

export default Conversation;
