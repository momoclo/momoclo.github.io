#!/usr/local/bin/zsh -
# ./generate.sh >| index.js
echo 'var data = ['
for HTML in 20*.html; do
    echo -n "{ date: \"${HTML/.html}\", url: \"./${HTML}\", title: \""
    grep '<title>' ${HTML} | perl -pe 's/<.*?>//g; s/^\s+//; s/\n//'
    echo -n '", content: "['
    perl -pe 's/<.*?>//g; s/\n/ /; s/"/\\"/g; s/\[/\\[/g; s/\]/\\]/g; s/\s+/ /g' ${HTML}
    echo ']"},'
done
echo ']'
