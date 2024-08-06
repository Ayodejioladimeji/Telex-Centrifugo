import React from 'react';
import ChatList from './ChatList';


const LeftSide = ({showNav, setShowNav}) => {
  return (
    <div style={{ position: 'relative' }}>
      <ChatList showNav={showNav} setShowNav={setShowNav} />
    </div>
  );
};

export default LeftSide;
