import { Box } from '@material-ui/core';
import React, { useState } from 'react';

interface Message {
    author: string;
    body: string;
    created: Date;
}
const initialMessages: Message[] = [{ author: "Ethan", body: "Hello", created: new Date() }];

function Log() {
    const [messages] = useState(initialMessages);

    return (
        <>
            <Box pt={{ xl: 4 }}>
                { messages[0] }
            </Box>
        </>
    );
}

export default Log