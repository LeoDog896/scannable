import { createReadStream } from 'fs';
import readline from 'readline';
import { generateFrame, renderText } from '../src';

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
test('Ensure https://google.com works', () => {
  expect(renderText('https://google.com')).toBe(google);
});

test('Ensure base example.com example is valid', () => {
  expect(renderText({ value: 'https://example.com' })).toBe(exampleCom);
});

jest.setTimeout(300 * 1000);

test('Ensure all resources are valid', async () => {
  let value: string | null = null;
  const fileStream = createReadStream('./test/resourceGen.txt');

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  for await (const entry of rl) {
    if (value == null) {
      value = entry;
      continue;
    }

    const int = new Uint8Array(
      BigInt(entry)
        .toString(2)
        .split('')
        .map((x) => (x == '1' ? 1 : 0))
    );

    expect(generateFrame({ value }).buffer).toStrictEqual(int);

    value = null;
  }
});

test('Ensure options can be passed to text renderer', () => {
  expect(
    renderText({
      value: 'https://example.com',
      foregroundChar: '█',
      backgroundChar: ' ',
    })
  ).toBe(exampleCom.replaceAll('#', '█'));
});
