import React from 'react';

/**
 * TherapistDashboard - 테라피스트를 위한 대시보드 컴포넌트입니다.
 * 학생 여러분: 본인의 일정 관리, 고객 히스토리 확인, 1:1 채팅 기능을 제공합니다.
 */
const TherapistDashboard = ({ therapistName, schedule }) => {
    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <h1>{therapistName} 테라피스트 일정</h1>
            </header>

            <section className="schedule-list">
                <h2>오늘의 예약 목록</h2>
                {schedule.length > 0 ? (
                    schedule.map((item, index) => (
                        <div key={index} className="schedule-card">
                            <div className="time">{item.time}</div>
                            <div className="customer-info">
                                <strong>{item.customerName}</strong> - {item.serviceType}
                            </div>
                            <button className="chat-btn">채팅하기</button>
                        </div>
                    ))
                ) : (
                    <p>오늘의 예약이 없습니다.</p>
                )}
            </section>

            <style jsx>{`
        .dashboard-container {
          padding: 1.5rem;
          background: #fff9f0;
          min-height: 100vh;
        }
        .schedule-card {
          background: #fff;
          margin-bottom: 1rem;
          padding: 1rem;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        .time {
          font-weight: bold;
          color: #e67e22;
          min-width: 80px;
        }
        .chat-btn {
          background: #34495e;
          color: #fff;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 5px;
          cursor: pointer;
        }
      `}</style>
        </div>
    );
};

export default TherapistDashboard;
