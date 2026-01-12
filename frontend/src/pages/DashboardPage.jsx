import React, { useState, useEffect } from 'react';
import { calculateBusinessDate, formatDisplayDate } from '../utils/dateUtils';
import { Calendar, Clock, ShieldAlert } from 'lucide-react';
const DashboardPage = () => {
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    const getTime = (tz) => new Date().toLocaleTimeString('en-US', { 
        timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: false 
    });

    const stdDate = calculateBusinessDate(now, 3);
    const caliDate = calculateBusinessDate(now, 5);
    const maxDate = new Date(now);
    maxDate.setDate(maxDate.getDate() + 35);

    return (
        <div className="dashboard-container">
            {/* --- HEADER --- */}
            <div className="dashboard-header">
                <div>
                    <h1 className="page-title">Operational Overview</h1>
                    <p className="page-subtitle">Real-time system status and deadlines.</p>
                </div>
                
                {/* Widget de Reloj idéntico al de Python */}
                <div className="clock-widget">
                    <div className="clock-item"><span>ET</span>{getTime('US/Eastern')}</div>
                    <div className="clock-item"><span>BOL</span>{getTime('America/La_Paz')}</div>
                    <div className="clock-item"><span>COL</span>{getTime('America/Bogota')}</div>
                </div>
            </div>

            {/* --- DATE CALCULATOR MODULE --- */}
            <section>
                <div className="section-subtitle">
                    <Calendar size={16} /> Payment Deadlines
                </div>
                
                <div className="stats-grid">
                    {/* Standard Card */}
                    <div className="stat-card">
                        <label>Standard (3 Biz Days)</label>
                        <div className="value">{formatDisplayDate(stdDate)}</div>
                    </div>

                    {/* California Card */}
                    <div className="stat-card">
                        <label>California (5 Biz Days)</label>
                        <div className="value">{formatDisplayDate(caliDate)}</div>
                    </div>

                    {/* Max Limit Card */}
                    <div className="stat-card critical">
                        <label>Max Limit (35 Calendar Days)</label>
                        <div className="value">{formatDisplayDate(maxDate)}</div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default DashboardPage;