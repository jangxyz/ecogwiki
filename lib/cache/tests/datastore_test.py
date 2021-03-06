#!/usr/bin/python2.5
#
# Test the cache.datatore.Client class.
#
# Copyright 2009 DeWitt Clinton
#
#   Licensed under the Apache License, Version 2.0 (the "License");
#   you may not use this file except in compliance with the License.
#   You may obtain a copy of the License at
#
#       http://www.apache.org/licenses/LICENSE-2.0
#
#   Unless required by applicable law or agreed to in writing, software
#   distributed under the License is distributed on an "AS IS" BASIS,
#   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#   See the License for the specific language governing permissions and
#   limitations under the License.

import test_utils
test_utils.init_appengine()

import cache_test
import unittest
import datastore


class ClientTest(cache_test.ClientTest):
  def __init__(self, *args, **kwargs):
    super(ClientTest, self).__init__(datastore.Client, *args, **kwargs)


def suite():
  suite = unittest.TestSuite()
  suite.addTests(unittest.makeSuite(ClientTest))
  return suite


if __name__ == '__main__':
  unittest.main()
