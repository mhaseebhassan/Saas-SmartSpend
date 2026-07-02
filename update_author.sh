#!/bin/sh
git filter-branch -f --env-filter '
    export GIT_AUTHOR_NAME="The Parallax Labs"
    export GIT_AUTHOR_EMAIL="muhammadhaseebhassan23@gmail.com"
    export GIT_COMMITTER_NAME="The Parallax Labs"
    export GIT_COMMITTER_EMAIL="muhammadhaseebhassan23@gmail.com"
' HEAD
