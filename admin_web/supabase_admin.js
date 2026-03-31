// Supabase Admin Panel JavaScript
// Используй этот код в admin_dark.html

const SUPABASE_URL = 'https://hyxyablgkjtoxcxnurkk.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5eHlhYmxna2p0b3hjeG51cmtrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxODE5NjksImV4cCI6MjA4NDc1Nzk2OX0._3HQYSymZ2ArXIN143gAiwulCL1yt7i5fiHaTd4bp5U';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

async function modifyRating(action) {
    const userId = document.getElementById('ratingUserId').value;
    const amount = document.getElementById('ratingAmount').value;
    
    if (!userId || !amount) {
        showResult('ratingResult', '❌ Заполните все поля', false);
        return;
    }
    
    try {
        // Получаем текущего пользователя
        const { data: user, error: fetchError } = await supabase
            .from('users')
            .select('rating')
            .eq('telegram_id', userId)
            .single();
        
        if (fetchError) throw fetchError;
        
        const finalAmount = action === 'remove' ? -Math.abs(parseInt(amount)) : Math.abs(parseInt(amount));
        const newRating = user.rating + finalAmount;
        
        // Обновляем рейтинг
        const { data, error } = await supabase
            .from('users')
            .update({ rating: newRating })
            .eq('telegram_id', userId)
            .select()
            .single();
        
        if (error) throw error;
        
        const actionText = action === 'add' ? 'Добавлено' : 'Убавлено';
        showResult('ratingResult', `✅ ${actionText}! Всего рейтинга: ${data.rating}`, true);
        document.getElementById('ratingAmount').value = '';
    } catch (error) {
        showResult('ratingResult', '❌ Ошибка: ' + error.message, false);
    }
}

async function modifyTokens(action) {
    const userId = document.getElementById('tokensUserId').value;
    const amount = document.getElementById('tokensAmount').value;
    
    if (!userId || !amount) {
        showResult('tokensResult', '❌ Заполните все поля', false);
        return;
    }
    
    try {
        const { data: user, error: fetchError } = await supabase
            .from('users')
            .select('tokens')
            .eq('telegram_id', userId)
            .single();
        
        if (fetchError) throw fetchError;
        
        const finalAmount = action === 'remove' ? -Math.abs(parseInt(amount)) : Math.abs(parseInt(amount));
        const newTokens = user.tokens + finalAmount;
        
        const { data, error } = await supabase
            .from('users')
            .update({ tokens: newTokens })
            .eq('telegram_id', userId)
            .select()
            .single();
        
        if (error) throw error;
        
        const actionText = action === 'add' ? 'Добавлено' : 'Убавлено';
        showResult('tokensResult', `✅ ${actionText}! Всего токенов: ${data.tokens}`, true);
        document.getElementById('tokensAmount').value = '';
    } catch (error) {
        showResult('tokensResult', '❌ Ошибка: ' + error.message, false);
    }
}

async function loadLeaderboard() {
    const content = document.getElementById('leaderboardContent');
    content.innerHTML = '<div class="loading">⏳ Загрузка...</div>';
    
    try {
        const { data: leaders, error } = await supabase
            .from('users')
            .select('*')
            .order('rating', { ascending: false })
            .order('tokens', { ascending: false })
            .limit(50);
        
        if (error) throw error;
        
        if (leaders.length === 0) {
            content.innerHTML = '<div class="loading">📭 Нет данных</div>';
            return;
        }
        
        content.innerHTML = leaders.map((leader, index) => {
            const rank = index + 1;
            let medal = '';
            if (rank === 1) medal = '💎';
            else if (rank === 2) medal = '🥇';
            else if (rank === 3) medal = '🥈';
            
            return `
                <div class="leader-item" onclick='showUserModal(${JSON.stringify(leader)})'>
                    <div class="leader-rank">${rank} ${medal}</div>
                    <div class="leader-info">
                        <div class="leader-name">${leader.name}</div>
                        <div class="leader-stats">⭐ ${leader.rating} • 🪙 ${leader.tokens}</div>
                    </div>
                </div>
            `;
        }).join('');
    } catch (error) {
        content.innerHTML = '<div class="loading">❌ Ошибка: ' + error.message + '</div>';
    }
}

async function updateUser() {
    if (!currentUser) return;
    
    const newName = document.getElementById('editName').value;
    const newAvatar = document.getElementById('editAvatar').value;
    
    if (!newName.trim()) {
        showToast('❌ Имя не может быть пустым', false);
        return;
    }
    
    try {
        const { data, error } = await supabase
            .from('users')
            .update({
                name: newName,
                avatar_url: newAvatar || null
            })
            .eq('telegram_id', currentUser.telegram_id)
            .select()
            .single();
        
        if (error) throw error;
        
        showToast('✅ Данные успешно обновлены!', true);
        closeModal();
        loadLeaderboard();
    } catch (error) {
        showToast('❌ Ошибка: ' + error.message, false);
    }
}

async function deleteUser() {
    if (!currentUser) return;
    
    try {
        const { error } = await supabase
            .from('users')
            .delete()
            .eq('telegram_id', currentUser.telegram_id);
        
        if (error) throw error;
        
        showToast('✅ Пользователь успешно удален', true);
        closeModal();
        setTimeout(() => loadLeaderboard(), 500);
    } catch (error) {
        showToast('❌ Ошибка: ' + error.message, false);
    }
}
