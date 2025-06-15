import { useEffect, useState } from 'react';
import {
    initDataRaw as _initDataRaw,
    initDataState as _initDataState,
    type User,
    useSignal,
  } from '@telegram-apps/sdk-react';

export const useTelegramUser = () => {
  const [telegramUser, setTelegramUser] = useState(null);
  const initDataRaw = useSignal(_initDataRaw);
  const initDataState = useSignal(_initDataState);

  useEffect(() => {
    if (initDataState && initDataState.user) {
      const user = initDataState.user;
      const firstName = user.first_name || '';
      const lastName = user.last_name || '';
      const fullName = `${firstName}${lastName ? ' ' + lastName : ''}`.trim();
      
      setTelegramUser({
        id: user.id,
        firstName,
        lastName,
        username: user.username,
        languageCode: user.language_code,
        // Создаем аватар URL на основе данных пользователя
        avatar: user.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName || 'User')}&background=007acc&color=fff&size=128`,
        // Создаем nickname из имени пользователя (приоритет: username > fullName > 'User')
        nickname: user.username || fullName || 'User',
        fullName: fullName || 'User'
      });
    } else {
      // Fallback для случаев, когда Telegram данные недоступны
      console.log('Telegram user data not available, using fallback');
    }
  }, [initDataState]);

  return telegramUser;
}; 