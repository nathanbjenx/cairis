#!/bin/bash
set -x
mysql --user=root --password=my-secret-pw < /sqlInit/createdb.sql
mysql --user=cairis_test --password=cairis_test --database=cairis_test_default < /sqlInit/init.sql
mysql --user=cairis_test --password=cairis_test --database=cairis_test_default < /sqlInit/procs.sql
mysql --user=root --password=my-secret-pw <<!
set global max_sp_recursion_depth = 255;
flush tables;
flush privileges;
!
