import React from 'react';

/**
 * OwnerDashboard - 매장 오너를 위한 대시보드 컴포넌트입니다.
 * 학생 여러분: 이 페이지에서는 매출 통계, 마케팅 캠페인 상태, 테라피스트 관리를 수행합니다.
 */
const OwnerDashboard = ({ shopData, stats }) => {
    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <h1>{shopData.name} - 관리자 패널</h1>
                <div className="user-info">오너님, 환영합니다!</div>
            </header>

            <section className="stats-grid">
                <div className="stat-card">
                    <h3>오늘의 매출</h3>
                    <p className="stat-value">₱ {stats.todayRevenue.toLocaleString()}</p>
                </div>
                <div className="stat-card">
                    <h3>신규 예약</h3>
                    <p className="stat-value">{stats.newBookings} 건</p>
                </div>
                <div className="stat-card">
                    <h3>활성 캠페인</h3>
                    <p className="stat-value">{stats.activeCampaigns} 개</p>
                </div>
            </section>

            <section className="campaign-setup">
                <h2>AI 마케팅 캠페인 설정</h2>
                <div className="campaign-card">
                    <p>현재 위치 기반 5km 이내 고객에게 자동 할인 알림 전송 중</p>
                    <button className="premium-btn">캠페인 수정하기</button>
                </div>
            </section>

            <style jsx>{`
        .dashboard-container {
          padding: 2rem;
          background: #f4f7f6;
          min-height: 100vh;
          font-family: 'Inter', sans-serif;
        }
        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          margin-bottom: 3rem;
        }
        .stat-card {
          background: #fff;
          padding: 1.5rem;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.05);
          text-align: center;
        }
        .stat-value {
          font-size: 1.8rem;
          font-weight: bold;
          color: #2c3e50;
          margin-top: 0.5rem;
        }
        .campaign-setup {
          background: #fff;
          padding: 2rem;
          border-radius: 15px;
          border-left: 5px solid #007bff;
        }
        .premium-btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: #fff;
          border: none;
          padding: 0.8rem 1.5rem;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
        }
      `}</style>
        </div>
    );
};

export default OwnerDashboard;
