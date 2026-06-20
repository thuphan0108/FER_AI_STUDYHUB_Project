import React from 'react';

export const FloatingChatBox = () => {
    return (
        <div style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            background: 'var(--card)',
            padding: '15px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 1000
        }}>
            <p style={{ margin: 0, color: 'var(--card-foreground)', fontWeight: 'bold' }}>💬 Chat Box Placeholder</p>
        </div>
    );
};