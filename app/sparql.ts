import { MatrixClient, MatrixError } from "matrix-bot-sdk";
import { AwaitMoreInputOptions, logError } from "matrix-bot-starter";
import { default as SparqlClient } from 'sparql-http-client';

function streamDataToTdString(streamData: any, headers : Set<string>) {
    if (typeof(streamData) == 'object') {
        const entries : [string, any][] = Object.entries(streamData); 
        
        let tds = '';
        for (let i = 0; i < entries.length; i++) {
            const entry = entries[i];
            const key = entry[0];
            const value = entry[1];

            // Don't add non-requested data
            if (!headers.has(key) && key != 'value') { continue; }

            tds += streamDataToTdString(value, headers);
            
        }
        return tds;

            
    } else {
        return `<td>${streamData}</td>`
    }
}

export async function runAndReturnSparql(client: MatrixClient, roomId: string, event: any, endpointUrl: string, query: string) {
    const threadStartEventId = event['content']['m.relates_to'] ? event['content']['m.relates_to']['event_id'] : event['event_id'];

    // Replace codeblock backticks
    query = query.replace(/```.*/gmi, '');

    client.sendMessage(roomId, {
        body: 'Running SPARQL Query...',
        format: 'org.matrix.custom.html',
        formatted_body: '<b>Running SPARQL Query...</b>',
        msgtype: 'm.text',
        'm.relates_to': {
            'rel_type': 'm.thread',
            'event_id': threadStartEventId
        }
    });

    try { 
        const sparqlClient = new SparqlClient({endpointUrl});
        const stream = await sparqlClient.query.select(query);
        //let intervalBetweenStreamMessage = 0;
        let timeout : NodeJS.Timeout;

        stream.on('error', (err) => {
            logError(err, client, roomId);
        });
    
        stream.on('readable', function(this: any) {
            let data : string = '';
            let headers : Set<string> = new Set();
            let streamData : Array<Array<any>>;

            while ((streamData = this.read()) !== null) {
                // Setup table headers
                Object.entries(streamData).forEach((value: Array<any>) => {
                    headers.add(value[0]);
                });
                
                
                data += '<tr>';
                data += streamDataToTdString(streamData, headers);
                data += '</tr>'


            }
            if (data == '') {
                // If there were no headers set, there was no data
                return;
            }
            
            let headersHtml = '';
            Array.from(headers).forEach((value, index) => {
                headersHtml += `<th>${value}</th>`;
            });
            
            data = `<table><tr>${headersHtml}</tr>${data}`;
            data += `</table>`;

            try {
                const content: any = {
                    body: data.replace(/<.*?>/gi, ''),
                    format: 'org.matrix.custom.html',
                    formatted_body: data,
                    msgtype: 'm.text',
                    'm.relates_to': {
                        'rel_type': 'm.thread',
                        'event_id': threadStartEventId
                    }
                };

                function catcher(err: MatrixError) {
                    if (err.errcode == 'M_LIMIT_EXCEEDED' && err.retryAfterMs) {
                        stream.destroy();

                        // Make sure to wait as long as the last error says
                        clearTimeout(timeout);

                        timeout = setTimeout(() => {
                            client.replyNotice(roomId, event, 'Rate limit reached. Try limiting the sparql query!')
                            //logError(err, client, roomId);
                            //client.sendMessage(roomId, content).catch(catcher);
                            //stream.resume();
                        }, err.retryAfterMs + 100);
                    };
                }

                client.sendMessage(roomId, content).catch(catcher);

                /*
                setTimeout(() => {
                    client.sendMessage(roomId, content).catch(catcher);
                    intervalBetweenStreamMessage += 3000;
                }, intervalBetweenStreamMessage);
                */
                    
            } catch (err) {
                logError(err, client, roomId)
            }
        });
    } catch (err) {
        logError(err, client, roomId);
    }
}

export async function awaitSparqlQuery(client: MatrixClient, roomId : string, event: any, options: AwaitMoreInputOptions) {
    if (!options.data) {
        return;
    }
    if (!options.data.url) {
        return;
    }

    const query = event['content']['body'];
    runAndReturnSparql(client, roomId, event, options.data.url, query);
}

export async function runSparqlFromMessage(client: MatrixClient, roomId : string, requestEventId : string, event : any, body : string, isEdit : Boolean) {
    const firstNewLine : number = body.indexOf('\n');
    const endpointUrl : string = body.substring(0, firstNewLine).trim();
    const query : string = body.substring(firstNewLine).trim();

    runAndReturnSparql(client, roomId, event, endpointUrl, query)
}