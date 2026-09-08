fx_version 'cerulean'
game 'gta5'

author 'baguscodestudio'
version '0.5.1'

ui_page 'web/dist/index.html'

files {
    'web/dist/index.html',
    'web/dist/assets/*.js',
    'web/dist/assets/*.css'
}

client_scripts {
    '@ox_lib/init.lua',
    'animations.lua',
    'props.lua',
    'client.lua',
}
