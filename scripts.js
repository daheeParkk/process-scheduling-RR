document.getElementById('addProcess').addEventListener('click', addProcess);
document.getElementById('simulate').addEventListener('click', simulateRR);

let processCount = 0;

function addProcess() {
    if (processCount >= 10) {
        alert('You can only add up to 10 processes.');
        return;
    }

    processCount++;
    const processDiv = document.createElement('div');
    processDiv.classList.add('process');
    processDiv.id = `processDiv${processCount}`;
    processDiv.innerHTML = `
        <label for="process${processCount}">Process ${processCount}:</label>
        <label>Arrival Time:</label>
        <input type="number" id="arrival${processCount}" min="0">
        <label>Service Time:</label>
        <input type="number" id="service${processCount}" min="1">
        <button onclick="removeProcess(${processCount})">Remove</button>
    `;
    document.getElementById('processes').appendChild(processDiv);
}

function removeProcess(id) {
    const processDiv = document.getElementById(`processDiv${id}`);
    processDiv.remove();
    processCount--;
}

function simulateRR() {
    const delta = parseInt(document.getElementById('delta').value);
    if (isNaN(delta) || delta < 2 || delta > 5) {
        alert('Please enter a valid delta value between 2 and 5.');
        return;
    }
    const processes = [];
    
    for (let i = 1; i <= processCount; i++) {
        const arrivalTime = document.getElementById(`arrival${i}`);
        const serviceTime = document.getElementById(`service${i}`);
        if (arrivalTime && serviceTime) {
            const arrivalValue = parseInt(arrivalTime.value);
            const serviceValue = parseInt(serviceTime.value);
            if (isNaN(arrivalValue) || isNaN(serviceValue) || arrivalValue < 0 || serviceValue <= 0) {
                alert('Please enter valid arrival and service times for all processes.');
                return;
            }
            processes.push({ id: `P${i}`, arrivalTime: arrivalValue, serviceTime: serviceValue, remainingTime: serviceValue, startTime: -1, completionTime: 0 });
        }
    }
    
    processes.sort((a, b) => a.arrivalTime - b.arrivalTime);

    let time = 0;
    let timeline = [];
    let queue = [];
    let avgResponseTime = 0;
    let totalResponseTime = 0;
    let completedProcesses = 0;
    
    while (processes.length > 0 || queue.length > 0) {
        while (processes.length > 0 && processes[0].arrivalTime <= time) {
            queue.push(processes.shift());
        }
        
        if (queue.length > 0) {
            const process = queue.shift();
            if (process.startTime === -1) {
                process.startTime = time;
            }
            const executionTime = Math.min(delta, process.remainingTime);
            process.remainingTime -= executionTime;
            timeline.push({ id: process.id, start: time, end: time + executionTime });
            time += executionTime;

            if (process.remainingTime > 0) {
                while (processes.length > 0 && processes[0].arrivalTime <= time) {
                    queue.push(processes.shift());
                }
                queue.push(process);
            } else {
                process.completionTime = time;
                totalResponseTime += (process.completionTime - process.arrivalTime);
                completedProcesses++;
            }
        } else {
            time++;
        }
    }

    avgResponseTime = totalResponseTime / completedProcesses;
    displayTimeline(timeline);
    document.getElementById('avgResponseTime').innerText = avgResponseTime.toFixed(2);
}

function displayTimeline(timeline) {
    const timelineDiv = document.getElementById('timeline');
    timelineDiv.innerHTML = '';
    timeline.forEach(block => {
        const blockDiv = document.createElement('div');
        blockDiv.classList.add('time-block');
        blockDiv.innerText = `${block.id} (${block.start}-${block.end})`;
        timelineDiv.appendChild(blockDiv);
    });
}
