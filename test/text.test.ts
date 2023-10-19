import { generateFrame, renderText } from '../src';
import { createReadStream } from 'fs';
import split from 'split';

const exampleCom = `#######  ##   # # #######
#     # ####   #  #     #
# ### # # #  ## # # ### #
# ### #   ##  ##  # ### #
# ### # #   ## ## # ### #
#     #  #####  # #     #
####### # # # # # #######
        ##  #            
##### ## ### #  ### # ## 
### ## ##   # #####   ## 
#  # ##    #   ## #### # 
 # #   ##   ###    #  ## 
   ## #### ## # ####     
#   ## #  #   # ### #  ##
## ######     #    ### ##
######  #  #   ####  #  #
 ##   ###  ########## ###
           ###  #   #   #
####### ##  ### # # #  ##
#     #   #   # #   ##  #
# ### # # #    ######### 
# ### # #   ##  ###### # 
# ### # # #   #      #   
#     # # ### ## ##    ##
####### ### ###  #### # #`;

const google = `#######   #  #  # #######
#     # #   ##  # #     #
# ### #   ##  #   # ### #
# ### #  # ## #   # ### #
# ### # # ## ##   # ### #
#     #  #  ##### #     #
####### # # # # # #######
          ## ###         
  # ### # # ## ###  #  # 
    ##  ####   ###   ## #
   #  ## ###    #   # ###
##  #   ### #  #  ## # # 
##  ### #  ## ###   ## # 
 #     ###  #   # ## #   
# # # #  # ##  ######  # 
#   #    ## ####       ##
## ##### ##     #####    
        #   #   #   ### #
#######   ### ### # ###  
#     # # ### ###   ## # 
# ### # ###  ########  # 
# ### #  ## # # #  ## ## 
# ### # # ### ###  ### ##
#     #  # ### #   # ####
#######     #      ###  #`;

// Weird version edge case
test("Ensure https://google.com works", () => {
  expect(renderText("https://google.com")).toBe(google);
});

test('Ensure base example.com example is valid', () => {
  expect(renderText({ value: 'https://example.com' })).toBe(exampleCom);
});

jest.setTimeout(300 * 1000)

test('Ensure all resources are valid', (done) => {
  let cnt = 0;
  let value: string | null = null;
  createReadStream('./test/resourceGen.txt', 'utf-16le')
    .pipe(split('\n'))
    .on('data', (entry: string) => {
      if (!entry) {
        return;
      }

      if (value == null) {
        value = entry;
        return;
      }

      const int = BigInt(entry).toString(2).split("").map(x => x == "1" ? 1 : 0);
      const arr = new Uint8Array(int);

      expect(generateFrame({ value }).buffer).toBe(arr);

      console.log(`Tested ${++cnt}th frame!`);

      value = null;
    })
    .on('close', done);
});

test('Ensure options can be passed to text renderer', () => {
  expect(renderText({
    value: 'https://example.com',
    foregroundChar: '█',
    backgroundChar: ' '
  })).toBe(exampleCom.replaceAll('#', '█'));
});
