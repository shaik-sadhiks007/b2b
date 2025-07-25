import { useEffect, useState } from "react";
import moment from "moment";

// Reusable TimeAgo component using moment.js
export const TimeAgo = ({ timestamp }) => {
    const [now, setNow] = useState(moment());

    useEffect(() => {
        const interval = setInterval(() => setNow(moment()), 60000); // update every minute
        return () => clearInterval(interval);
    }, []);

    return <span>{moment(now).fromNow()}</span>;
};