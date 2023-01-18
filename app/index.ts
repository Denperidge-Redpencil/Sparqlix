// index.ts
import { MatrixClient } from 'matrix-bot-sdk';
import { newClient, awaitMoreInput, onMessage, changeAvatar, changeDisplayname } from 'matrix-bot-starter';

import { awaitSparqlQuery } from './sparql';
const regexUrl : RegExp = /http\S+/i;

async function onEvents(client : MatrixClient) {
    onMessage(client, 
        async (roomId : string, event : any, sender: string, content: any, body: any, requestEventId: string, isEdit: boolean, isHtml: boolean, mentioned: string) => {
        
        if (isHtml) {
            if (mentioned) {
                let command = mentioned.toLowerCase();
                let url : string | undefined = command.match(regexUrl)?.[0];
                console.log(command)

                if (command.startsWith('picture') || command.startsWith('avatar')) {
                    awaitMoreInput(client, roomId, event,
                        true, 
                        {
                            description: 'avatar change',
                            messageType: 'm.image',
                            functionToExecute: changeAvatar
                        }, 
                        'Setting new avatar! If your next message is an image, I will update my avatar to that.');    
                }

                if (command.startsWith('name') || command.startsWith('handle')) {
                    awaitMoreInput(client, roomId, event,
                        true, 
                        {
                            description: 'display name change',
                            messageType: 'm.text',
                            functionToExecute: changeDisplayname
                        }, 
                        'Setting new display name! I\'ll set it to the contents of your next message.');
                }
                
                if ((command.startsWith('sparql'))) {
                    if (url == undefined) {
                        client.replyNotice(roomId, event, 'Missing URL! Correct syntax: `@me sparql {url}`.');
                    } else {
                        awaitMoreInput(client, roomId, event, false,
                            {
                                description: 'running SPARQL query',
                                messageType: 'm.text',
                                functionToExecute: awaitSparqlQuery,
                                data: {url}
                            },
                            `Running a SPARQL query on ${url}! Send it in your next message.`)
                    }
                    
                }
                
            }
        }

        //runSparqlFromMessage(client, roomId, requestEventId, event, body, isEdit);

    });

}

newClient().then((client : MatrixClient) => {
    onEvents(client);
});