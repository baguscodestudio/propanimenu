fx_version 'cerulean'
game 'gta5'

author 'baguscodestudio'
version '0.5.0'

ui_page 'web/html/index.html'

files {
    'web/html/index.html',
    'web/html/assets/*.js',
    'web/html/assets/*.css'
}

client_scripts {
    '@menuv/menuv.lua',
    'animations.lua',
    'client.lua'
}