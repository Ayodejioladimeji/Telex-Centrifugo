import React from 'react';

// COMPONENTS
import styles from '@/styles/index.module.css';
import LeftSide from '@/components/LeftSide';
import RightSide from '@/components/RightSide';

const Conversation = () => {
  return (
    <div className={styles.conversation}>
      <div className={styles.left_conversations}>
        <LeftSide />
      </div>

      <div className={styles.conversate}>
        <RightSide />
      </div>
    </div>
  );
};

export default Conversation;
