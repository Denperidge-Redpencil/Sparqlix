import { MatrixClient } from "matrix-bot-sdk";
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
    client.replyNotice(roomId, event, 'Running SPARQL Query...');

    try { 
        const sparqlClient = new SparqlClient({endpointUrl});
        const stream = await sparqlClient.query.select(query);

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
                client.replyHtmlText(roomId, event, data);
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