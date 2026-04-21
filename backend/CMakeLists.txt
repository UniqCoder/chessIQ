cmake_minimum_required(VERSION 3.10)
project(ChessIQBackend)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# If compiling on Windows with MSVC, disable some warnings for httplib
if(MSVC)
    add_compile_options(/W3 /wd4005 /wd4267 /wd4244)
    add_definitions(-D_CRT_SECURE_NO_WARNINGS)
    # Required for httplib on Windows
    link_libraries(ws2_32)
endif()

include_directories(include)

add_executable(chessiq_server 
    src/main.cpp 
    src/server.cpp 
    src/game.cpp 
    src/board.cpp
)

if(WIN32)
    target_link_libraries(chessiq_server ws2_32 crypt32)
endif()
