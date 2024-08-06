import React, { useState } from 'react';

// COMPONENTS
import styles from '../styles/index.module.css';
import LeftSide from '@/components/LeftSide';
import NameModal from '@/common/name-modal';
import { FaAlignJustify } from 'react-icons/fa';

const Conversation = () => {
  const [showNav, setShowNav] = useState(false)

  return (
    <div className={styles.conversation}>
      <div className={styles.new_left_conversations}>
        <LeftSide showNav={showNav} setShowNav={setShowNav} />
      </div>

      <div className={styles.new_right_conversations}>
        <div className={styles.right_center}>
          <h4>
            Telex Room Chat</h4>
          <p>
            Select a room to start chatting
          </p>
        </div>
      </div>
    </div>
  );
};

export default Conversation;
