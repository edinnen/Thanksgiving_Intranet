import { Box } from '@material-ui/core';
import { getEntriesData } from '../../../redux/actions';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppState } from 'redux/store';
import { addEntry } from 'utils';

function Log() {
    const [newAuthor, setAuthor] = useState("");
    const [newBody, setBody] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleBody = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setBody(event.target.value);
    };

    const handleAuthor = (event: React.ChangeEvent<HTMLInputElement>) => {
        setAuthor(event.target.value);
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        const res = await addEntry({
            author: newAuthor,
            body: newBody,
        });
        setSubmitting(false);
        if (res.status !== 200) {
            console.error("Failed to submit log entry! Status code:", res.status);
            return;
        }
        dispatch(getEntriesData());
    }

    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(getEntriesData());
    }, [dispatch]);

    const { entries } = useSelector<AppState, AppState['dashboard']>(
        ({ dashboard }) => dashboard,
    );

    return (
        <>
            <Box pt={{ xl: 4 }}>
                <h1>Add an entry</h1>
                <div style={{ marginBottom: 40 }}>
                    <textarea onChange={handleBody} placeholder="Log entry..." /><br />
                    <input type="text" onChange={handleAuthor} placeholder="Name" />
                    <button onClick={handleSubmit} disabled={submitting}>Submit</button>
                </div>
                <h1>Log Entries</h1>
                <div>
                    {entries?.map(({ author, body, created }) => {
                        return (
                            <div style={{ position: "relative", marginBottom: 5, width: "100%", backgroundColor: "teal", borderRadius: 5, padding: "15px 10px 40px 10px" }}>
                                <p>{body}</p>
                                <span style={{ position: "absolute", right: 10, bottom: 10 }}>{author} - {created?.toTimeString()}</span>
                            </div>
                        );
                    })}
                </div>
            </Box>
        </>
    );
}

export default Log