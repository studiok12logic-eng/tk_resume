
document.addEventListener('DOMContentLoaded', () => {
    fetchData();
    setupButtons();
});

async function fetchData() {
    try {
        const response = await fetch('resume_data.json');
        const data = await response.json();
        
        if (document.getElementById('resume-page')) {
            renderResume(data);
        } else if (document.getElementById('skills-page')) {
            renderSkills(data);
        }
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

function setupButtons() {
    const backBtn = document.getElementById('btn-back');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }

    const downloadBtn = document.getElementById('btn-download');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', () => {
            window.print();
        });
    }
}

function calculateAge(birthDate) {
    const today = new Date();
    const birth = new Date(birthDate.year, birthDate.month - 1, birthDate.day);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return age;
}

function renderResume(data) {
    // Current Date
    const dateRight = document.querySelector('.date-right');
    if (dateRight) dateRight.textContent = `${data.lastUpdated} 現在`;

    // Profile
    document.getElementById('profile-furigana').textContent = `ふりがな　${data.profile.furigana}`;
    document.getElementById('profile-name').textContent = `氏名　　${data.profile.name}`;
    
    const age = calculateAge(data.profile.birthDate);
    // Convert year to Japanese Era roughly or just use full string from data if structured that way.
    // Simplifying to YYYY/MM/DD for now or constructing typical JP format
    // Heisei 3 is 1991.
    document.getElementById('profile-birth').innerHTML = `${data.profile.birthDate.year}年 ${data.profile.birthDate.month}月 ${data.profile.birthDate.day}日生 (満 ${age}歳) &nbsp;&nbsp;&nbsp;&nbsp; 性別　${data.profile.gender}`;

    document.getElementById('profile-addr-furigana').textContent = `ふりがな　${data.profile.address.furigana}`;
    document.getElementById('profile-addr').innerHTML = `現住所　〒 ${data.profile.address.zip} <br>${data.profile.address.text}`;
    document.getElementById('profile-phone').textContent = data.profile.phone;
    
    const photoImg = document.getElementById('profile-photo');
    if (photoImg) photoImg.src = data.profile.imagePath;

    // Education & Work
    const historyBody = document.getElementById('history-body');
    historyBody.innerHTML = ''; // Clear existing

    // Helper to add rows
    const addRow = (year, month, content, className = '') => {
        const tr = document.createElement('tr');
        // Convert 2010 -> Heisei 22, etc. (Optional, implementing simple logic or using data as is)
        // For simplicity, we assume data needs conversion or display as is. 
        // Let's implement a simple era converter or just output year.
        // The user's example used "平成22", "令和1".
        
        let eraYear = year;
        let eraName = "";
        
        if (year < 2019) {
            eraName = "平成";
            eraYear = year - 1988;
        } else {
            eraName = "令和";
            eraYear = year - 2018;
        }

        tr.innerHTML = `
            <td class="text-center">${eraName}${eraYear}</td>
            <td class="text-center">${month}</td>
            <td class="${className}">${content}</td>
        `;
        historyBody.appendChild(tr);
    };

    const addHeader = (title) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="text-center"></td>
            <td class="text-center"></td>
            <td class="section-title">${title}</td>
        `;
        historyBody.appendChild(tr);
    };

    addHeader('学歴');
    data.education.forEach(item => addRow(item.year, item.month, item.text));
    
    addRow('', '', ''); // Spacer

    addHeader('職歴');
    data.workHistory.forEach(item => addRow(item.year, item.month, item.text));
    
    const endTr = document.createElement('tr');
    endTr.innerHTML = `<td></td><td></td><td class="text-right">以上</td>`;
    historyBody.appendChild(endTr);

    // Licenses
    const licenseBody = document.getElementById('license-body');
    licenseBody.innerHTML = '';
    data.licenses.forEach(item => {
        const tr = document.createElement('tr');
         let eraYear = item.year;
        let eraName = "";
        if (item.year < 2019) {
            eraName = "平成";
            eraYear = item.year - 1988;
        } else {
            eraName = "令和";
            eraYear = item.year - 2018;
        }
        tr.innerHTML = `
             <td class="text-center">${eraName}${eraYear}</td>
            <td class="text-center">${item.month}</td>
            <td>${item.text}</td>
        `;
        licenseBody.appendChild(tr);
    });

    // Family
    document.getElementById('family-dependents').textContent = `${data.family.dependents}人`;
    document.getElementById('family-spouse').textContent = data.family.spouse;
    document.getElementById('family-obligation').textContent = data.family.spouseObligation;
    
    // Motivation
    document.getElementById('motivation-text').innerHTML = data.motivation || '';
    document.getElementById('requests-text').innerHTML = data.requests || '';

}

function renderSkills(data) {
     // Current Date
    const dateRight = document.querySelector('.date-right');
    if (dateRight) dateRight.textContent = `${data.lastUpdated} 現在`;
    
    document.getElementById('skill-name').textContent = `氏名：${data.profile.name}`;

    // Summary
    document.getElementById('skill-summary').innerHTML = data.skills.summary.replace(/\n/g, '<br>');

    // Tech List
    const techUl = document.getElementById('skill-tech-list');
    techUl.innerHTML = '';
    data.skills.techList.forEach(tech => {
        const li = document.createElement('li');
        li.textContent = tech;
        techUl.appendChild(li);
    });

    // History
    const historyContainer = document.getElementById('skill-history-container');
    historyContainer.innerHTML = '';
    
    // Header setup
    const sectionHeader = document.createElement('h2');
    sectionHeader.textContent = '■ 職務経歴';
    historyContainer.appendChild(sectionHeader);

    data.skills.history.forEach(company => {
        const h3 = document.createElement('h3');
        h3.style.cssText = 'border-bottom: 1px solid #ccc; margin-top: 20px;';
        h3.textContent = company.company;
        historyContainer.appendChild(h3);

        const p = document.createElement('p');
        p.textContent = `事業内容：${company.business}`;
        historyContainer.appendChild(p);

        const table = document.createElement('table');
        table.className = 'skill-table';
        table.innerHTML = `
            <tr>
                <th>期間</th>
                <th>業務内容</th>
                <th>役割・規模</th>
            </tr>
        `;
        
        company.entries.forEach(entry => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${entry.term}</td>
                <td>${entry.content}</td>
                <td>${entry.role}</td>
            `;
            table.appendChild(tr);
        });
        historyContainer.appendChild(table);
    });

     // Self Promotion
    const selfPromoContainer = document.getElementById('self-promo-container');
    // Using simple approach to fill existing structure if possible or rebuild.
    // Let's rebuild for flexibility.
    selfPromoContainer.innerHTML = `<h2>■ 自己PR</h2>`;
    
    const p = document.createElement('p');
    p.innerHTML = `
        <strong>${data.skills.selfPromotion.title1}</strong><br>
        ${data.skills.selfPromotion.desc1}
        <br><br>
        <strong>${data.skills.selfPromotion.title2}</strong><br>
        ${data.skills.selfPromotion.desc2}
    `;
    selfPromoContainer.appendChild(p);
}
