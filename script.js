
// Expose checkPassword globally
window.checkPassword = async function() {
    const input = document.getElementById('password-input').value;
    const errorMsg = document.getElementById('error-msg');

    try {
        const response = await fetch('resume_data.json');
        const data = await response.json();

        if (data.variants && data.variants[input]) {
            localStorage.setItem('resume_variant', input); // Store the "password" as the variant key
            
            // UI Logic for index.html
            const loginArea = document.getElementById('login-area');
            const contentArea = document.getElementById('content-area');
            if (loginArea && contentArea) {
                loginArea.style.display = 'none';
                contentArea.style.display = 'flex';
            }
        } else {
            errorMsg.style.display = 'block';
        }
    } catch (e) {
        console.error("Login Error", e);
        errorMsg.textContent = "データ読み込みエラー";
        errorMsg.style.display = 'block';
    }
};

document.addEventListener('DOMContentLoaded', () => {
    // Index Page Auto-Login Check
    if (document.getElementById('login-area')) {
        const storedVariant = localStorage.getItem('resume_variant');
        if (storedVariant) {
             // Verify validity (optional, but good practice in case JSON changed keys)
             fetch('resume_data.json').then(res => res.json()).then(data => {
                 if (data.variants[storedVariant]) {
                     document.getElementById('login-area').style.display = 'none';
                     document.getElementById('content-area').style.display = 'flex';
                 } else {
                     localStorage.removeItem('resume_variant'); // Invalid key
                 }
             });
        }
        
        // Bind events for index.html
        const loginBtn = document.getElementById('login-btn');
        const passInput = document.getElementById('password-input');
        if (loginBtn) {
            loginBtn.addEventListener('click', window.checkPassword);
        }
        if (passInput) {
            passInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') window.checkPassword();
            });
        }
    } else {
        fetchData();
        setupButtons();
    }
});

async function fetchData() {
    try {
        const response = await fetch('resume_data.json');
        const data = await response.json();
        
        // Get variant
        const variantKey = localStorage.getItem('resume_variant');
        const variant = (data.variants && variantKey) ? data.variants[variantKey] : null;

        // Redirect if no valid login (protect sub-pages)
        if (!variant && !document.getElementById('login-area')) {
             // If we are on a sub-page but have no auth, redirect to index
            window.location.href = 'index.html';
            return;
        }

        if (document.getElementById('resume-page')) {
            renderResume(data, variant);
        } else if (document.getElementById('skills-page')) {
            renderSkills(data, variant);
        }
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

function setupButtons() {
    const backBtn = document.getElementById('btn-back');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
             // Clear auth on explicit back? No, usually keep it.
             // If user wants to logout, they should close tab or we add logout button.
             // For now just link back.
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

function renderResume(data, variant) {
    // Current Date
    const dateRight = document.querySelector('.date-right');
    if (dateRight) dateRight.textContent = `${data.lastUpdated} 現在`;

    // Profile
    document.getElementById('profile-furigana').textContent = `ふりがな　${data.profile.furigana}`;
    document.getElementById('profile-name').textContent = `氏名　　${data.profile.name}`;
    
    const age = calculateAge(data.profile.birthDate);
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
        
        let yearText = "";
        let monthText = "";

        if (year) {
            let eraYear = year;
            let eraName = "";
            
            if (year < 2019) {
                eraName = "平成";
                eraYear = year - 1988;
            } else {
                eraName = "令和";
                eraYear = year - 2018;
            }
            yearText = `${eraName}${eraYear}`;
            monthText = month;
        }

        tr.innerHTML = `
            <td class="text-center">${yearText}</td>
            <td class="text-center">${monthText}</td>
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
        let yearText = "";
        
        if (item.year) {
             let eraYear = item.year;
            let eraName = "";
            if (item.year < 2019) {
                eraName = "平成";
                eraYear = item.year - 1988;
            } else {
                eraName = "令和";
                eraYear = item.year - 2018;
            }
            yearText = `${eraName}${eraYear}`;
        }
       
        tr.innerHTML = `
             <td class="text-center">${yearText}</td>
            <td class="text-center">${item.month}</td>
            <td>${item.text}</td>
        `;
        licenseBody.appendChild(tr);
    });

    // Family
    document.getElementById('family-dependents').textContent = `${data.family.dependents}人`;
    document.getElementById('family-spouse').textContent = data.family.spouse;
    document.getElementById('family-obligation').textContent = data.family.spouseObligation;
    
    // Motivation & Requests (FROM VARIANT)
    const motivationText = variant ? variant.motivation : "";
    const requestsText = variant ? variant.requests : "";

    document.getElementById('motivation-text').innerHTML = motivationText.replace(/\n/g, '<br>');
    document.getElementById('requests-text').innerHTML = requestsText.replace(/\n/g, '<br>');

}

function renderSkills(data, variant) {
     // Current Date
    const dateRight = document.querySelector('.date-right');
    if (dateRight) dateRight.textContent = `${data.lastUpdated} 現在`;
    
    document.getElementById('skill-name').textContent = `氏名：${data.profile.name}`;

    // Summary
    document.getElementById('skill-summary').innerHTML = data.skills.summary.replace(/\n/g, '<br>');

    // Tech List (PC Skills)
    const techArea = document.getElementById('skill-tech-list');
    const sectionDiv = techArea.parentNode;
    sectionDiv.innerHTML = '<h2>■ 活かせる経験・知識・技術（PCスキル）</h2>';
    
    const table = document.createElement('table');
    table.className = 'skill-table';
    table.innerHTML = `
        <tr>
            <th style="width: 30%;">スキル</th>
            <th>レベル・詳細</th>
        </tr>
    `;

    const skillsList = data.skills.pcSkills || data.skills.techList;
    if (skillsList && skillsList.length > 0) {
        if (typeof skillsList[0] === 'string') {
            skillsList.forEach(tech => {
                const tr = document.createElement('tr');
                tr.innerHTML = `<td>${tech}</td><td>-</td>`;
                table.appendChild(tr);
            });
        } else {
             skillsList.forEach(skill => {
                const tr = document.createElement('tr');
                tr.innerHTML = `<td>${skill.name}</td><td>${skill.level}</td>`;
                table.appendChild(tr);
            });
        }
    }
    sectionDiv.appendChild(table);

    // History
    const historyContainer = document.getElementById('skill-history-container');
    historyContainer.innerHTML = '';
    
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
                <th style="width: 15%;">期間</th>
                <th style="width: 70%;">業務内容</th>
                <th style="width: 15%;">役割</th>
            </tr>
        `;
        
        company.entries.forEach(entry => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="text-align: center;">${entry.term}</td>
                <td>${entry.content}</td>
                <td style="text-align: center;">${entry.role}</td>
            `;
            table.appendChild(tr);
        });
        historyContainer.appendChild(table);
    });

     // Self Promotion
    const selfPromoContainer = document.getElementById('self-promo-container');
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
